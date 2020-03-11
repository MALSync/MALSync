import * as helper from "./../provider/AniList/helper";
import {pageSearch} from './../pages/pages';
import {Single as anilistSingle} from "./../_provider/AniList/single";
import {userlist} from "./../_provider/AniList/list";

interface detail{
  page: "detail",
  id: number,
  malid: number,
  type: "anime"|"manga"
}

interface bookmarks{
  page: "bookmarks",
  type: "anime"|"manga"
}

export class anilistClass{
  page: any = null

  constructor(public url:string){
    var first = true;
    utils.changeDetect(() => {
      this.url = window.location.href;
      this.init();
    }, () => {
      if(first){
        first = false;
        return undefined;
      }
      if(this.page !== null && this.page.page == "bookmarks" && $('.lists').length){
        return $('.lists').first().height();
      }
      var ogUrl = $('meta[property="og:url"]').attr('content');
      if(typeof ogUrl !== 'undefined' && ogUrl.split('/').length > 4){
        return ogUrl.split('/').slice(0,6).join('/');
      }else{
        ogUrl = window.location.href;
      }
      return ogUrl;
    });

    if(this.url.indexOf("access_token=") > -1){
      this.init();
    }

    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
  }

  init(){
    if(this.url.indexOf("access_token=") > -1){
      this.authentication();
    }

    var urlpart = utils.urlPart(this.url, 3);
    if(urlpart == 'anime' || urlpart == 'manga'){
      this.page = {
        page: "detail",
        id: utils.urlPart(this.url, 4),
        malid: NaN,
        type: urlpart
      }
      this.siteSearch();
      this.streamingUI();
      helper.aniListToMal(this.page.id, this.page.type).then((malid)=>{
        this.page!.malid = malid;
        con.log('page', this.page);
        this.malToKiss();
      });
    }

    var urlpart4 = utils.urlPart(this.url, 5);
    if(urlpart4 == 'animelist' || urlpart4 == 'mangalist'){
      this.page = {
        page: "bookmarks",
        type: urlpart4.substring(0, 5)
      }
      this.bookmarks();
    }

  }

  authentication(){
    try{
      utils.checkDoubleExecution();
    }catch(e){
      con.error(e);
    }
    var tokens = /access_token=[^&]+/gi.exec(this.url);
    if(tokens != null && typeof tokens[0] != 'undefined' && tokens[0]){
      var token = tokens[0].toString().replace(/access_token=/gi, '');
      con.log('Token Found', token);
      api.settings.set('anilistToken', token).then(() => {
        $(document).ready(function(){
          $('.page-content .container').html(`
            <div style="text-align: center; margin-top: 50px; background-color: white; border: 1px solid lightgrey; padding: 10px;">
              <h1>MAL-Sync</h1>
              <br>
              ` + api.storage.lang("anilistClass_authentication") + `
            </div>
          `);
        });
      });
    }
  }

  async getMalUrl(){
    var urlpart = utils.urlPart(this.url, 3);
    if(urlpart == 'anime' || urlpart == 'manga'){
      var aniListId = utils.urlPart(this.url, 4);
      return helper.aniListToMal(aniListId, urlpart).then((malId)=>{
        if(!malId) return '';
        return 'https://myanimelist.net/'+urlpart+'/'+malId+'/'+utils.urlPart(this.url, 5);
      });
    }
    return '';
  }

  malToKiss(){
    con.log('malToKiss');
    $('.mal_links').remove();
    utils.getMalToKissArray(this.page!.type, this.page!.malid).then((links) => {
      var html = '';
      for(var pageKey in links){
        var page = links[pageKey];

        var tempHtml = '';
        var tempUrl = '';
        for(var streamKey in page){
          var stream = page[streamKey];
          tempHtml += `
          <div class="mal_links" style="margin-top: 5px;">
            <a target="_blank" href="${stream['url']}">
              ${stream['title']}
            </a>
          </div>`;
          tempUrl = stream['url'];
        }
        html += `
          <div id="${pageKey}Links" class="mal_links" style="
            background: rgb(var(--color-foreground));
            border-radius: 3px;
            display: block;
            padding: 8px 12px;
            width: 100%;
            margin-bottom: 16px;
            font-size: 1.2rem;

          ">
            <img src="${utils.favicon(tempUrl.split('/')[2])}">
            <span style="font-weight: 500; line-height: 16px; vertical-align: middle;">${pageKey}</span>
            <span title="${pageKey}" class="remove-mal-sync" style="float: right; cursor: pointer;">x</span>
            ${tempHtml}
          </div>`;

      }
      $(document).ready(function(){
        $('.mal_links').remove();
        $('.sidebar .data').before(html);
        $('.remove-mal-sync').click(function(){
          var key = $(this).attr('title');
          api.settings.set(key, false);
          location.reload();
        });
      });
    })
  }

  siteSearch(){
    if(!api.settings.get('SiteSearch')) return;
    var This = this;
    $(document).ready(function(){
      con.log('Site Search');
      $('#mal-sync-search-links').remove();
      $('.sidebar .data').before(`
        <div id="mal-sync-search-links" style="
            background: rgb(var(--color-foreground));
            border-radius: 3px;
            display: block;
            padding: 8px 12px;
            width: 100%;
            margin-bottom: 16px;
            font-size: 1.2rem;
        ">
          <span style="font-weight: 500; line-height: 16px; vertical-align: middle;">`+api.storage.lang("Search")+`</span>
          <div class="MALSync-search"><a>[`+api.storage.lang("Show")+`]</a></div><br class="mal_links" />
        </div>
      `);
      api.storage.addStyle('#AniList.mal_links img{background-color: #898989;}');
      $('.MALSync-search').one('click', () => {
        var title = $('meta[property="og:title"]').attr('content')
        var titleEncoded = encodeURI(title!);
        var html = '';
        var imgStyle = 'position: relative; top: 0px;'

        for (var key in pageSearch) {
          var page = pageSearch[key];
          if(page.type !== This.page!.type) continue;

          var linkContent = `<img style="${imgStyle}" src="${utils.favicon(page.domain)}"> ${page.name}`;
          if( typeof page.completeSearchTag === 'undefined'){
            var link =
            `<a target="_blank" href="${page.searchUrl(titleEncoded)}">
              ${linkContent}
            </a>`
          }else{
            var link = page.completeSearchTag(title, linkContent);
          }

          var googleSeach = '';
          if( typeof page.googleSearchDomain !== 'undefined'){
            googleSeach =`<a target="_blank" href="https://www.google.com/search?q=${titleEncoded}+site:${page.googleSearchDomain}">
              <img style="${imgStyle}" src="${utils.favicon('google.com')}">
            </a>`;
          }

          html +=
          `<div class="mal_links" id="${key}" style="padding: 1px 0;">
              ${link}
              ${googleSeach}
          </div>`;
        }

        $('.MALSync-search').html(html);
      });
    });
  }

  async streamingUI(){
    con.log('Streaming UI');
    $('#mal-sync-stream-div').remove();
    var malObj = new anilistSingle(this.url);
    await malObj.update();

    var streamUrl = malObj.getStreamingUrl();
    if(typeof streamUrl !== 'undefined'){

      $(document).ready(async function(){
        $('#mal-sync-stream-div').remove();
        $('h1').first().append(`
        <div class="data title progress" id="mal-sync-stream-div" style="margin-top: -2px; display: inline-block; position: relative; top: 2px;">
          <a class="mal-sync-stream" title="${streamUrl.split('/')[2]}" target="_blank" style="margin: 0 0;" href="${streamUrl}">
            <img src="${utils.favicon(streamUrl.split('/')[2])}">
          </a>
        </div>`);

        var resumeUrlObj = await malObj.getResumeWaching();
        var continueUrlObj = await malObj.getContinueWaching();
        con.log('Resume', resumeUrlObj, 'Continue', continueUrlObj);
        if(typeof continueUrlObj !== 'undefined' && continueUrlObj.ep === (malObj.getEpisode()+1)){
          $('#mal-sync-stream-div').append(
            `<a class="nextStream" title="${api.storage.lang('overview_Continue_'+malObj.getType())}" target="_blank" style="margin: 0 5px 0 0; color: #BABABA;" href="${continueUrlObj.url}">
              <img src="${api.storage.assetUrl('double-arrow-16px.png')}" width="16" height="16">
            </a>`
            );
        }else if(typeof resumeUrlObj !== 'undefined' && resumeUrlObj.ep === malObj.getEpisode()){
          $('#mal-sync-stream-div').append(
            `<a class="resumeStream" title="${api.storage.lang('overview_Resume_Episode_'+malObj.getType())}" target="_blank" style="margin: 0 5px 0 0; color: #BABABA;" href="${resumeUrlObj.url}">
              <img src="${api.storage.assetUrl('arrow-16px.png')}" width="16" height="16">
            </a>`
            );
        }

      });
    }
  }

  private tempAnimelist:any = null;
  private tempMangalist:any = null;

  bookmarks(){
    var This = this;
    $(document).ready(() => {
      $('.list-entries .entry, .list-entries .entry-card').not('.malSyncDone').each((index, el) => {
        $(el).addClass('malSyncDone')
        var streamUrl = utils.getUrlFromTags($(el).find('.notes').first().attr('label'));
        if(typeof streamUrl !== 'undefined'){
          con.log(streamUrl);
          $(el).find('.title a').first().after(`
            <a class="mal-sync-stream mal-rem" title="${streamUrl.split('/')[2]}" target="_blank" style="margin: 0 0; max-height: 14px;" href="${streamUrl}">
              <img src="${utils.favicon(streamUrl.split('/')[2])}">
            </a>`);

          var label = $(el).find('.notes').first().attr('label');
          if(typeof label != 'undefined'){
            label = label.replace(/(malSync|last)::[\d\D]+::/,'').replace(/#,/, '');
            if(label.trim() === '' || label.trim() === ','){
              $(el).find('.notes').first().css('visibility', 'hidden');
            }else{
              $(el).find('.notes').first().attr('label', label);
            }
          }

        }

      })

      if(this.page!.type == 'anime'){
        if(this.tempAnimelist != null){
          fullListCallback(this.tempAnimelist);
          return;
        }
      }else{
        if(this.tempMangalist != null){
          fullListCallback(this.tempMangalist);
          return;
        }
      }

      var listProvider = new userlist(1, this.page!.type);

      listProvider.compact = true;

      listProvider.get().then( (list) => {
        if(this.page!.type == 'anime'){
          this.tempAnimelist = list;
        }else{
          this.tempMangalist = list;
        }
        fullListCallback(list);
      }).catch((e) => {
        con.error(e);
        listProvider.flashmError(e);
      });

      function fullListCallback(list){
        con.log(list);
        $.each(list, async (index, en) => {
          con.log('en', en);
          if(typeof en.malid !== 'undefined' && en.malid !== null && en.malid){
            var element = $('.entry:not(.malSyncDone2) a[href^="/'+This.page!.type+'/'+en.id+'/"], .entry-card:not(.malSyncDone2) a[href^="/'+This.page!.type+'/'+en.id+'/"]').first().parent();
            con.log(element);
            element.parent().addClass('malSyncDone2');

            var resumeUrlObj = await utils.getResumeWaching(This.page!.type, en.cacheKey);
            var continueUrlObj = await utils.getContinueWaching(This.page!.type, en.cacheKey);

            var curEp = en.watchedEp;

            con.log('Resume', resumeUrlObj, 'Continue', continueUrlObj);
            if(typeof continueUrlObj !== 'undefined' && continueUrlObj.ep === (curEp+1)){
              element.prepend(
                `<a class="nextStream mal-rem" title="Continue watching" target="_blank" style="margin: -2px 5px 0 0; color: #BABABA;" href="${continueUrlObj.url}">
                  <img src="${api.storage.assetUrl('double-arrow-16px.png')}" width="16" height="16">
                </a>`
                );
            }else if(typeof resumeUrlObj !== 'undefined' && resumeUrlObj.ep === curEp){
              element.prepend(
                `<a class="resumeStream mal-rem" title="Resume watching" target="_blank" style="margin: -2px 5px 0 0; color: #BABABA;" href="${resumeUrlObj.url}">
                  <img src="${api.storage.assetUrl('arrow-16px.png')}" width="16" height="16">
                </a>`
                );
            }

            utils.epPredictionUI(en.malid, en.cacheKey, This.page!.type, (prediction) => {
              if(!prediction) return;
              element.parent().find('.progress').append(prediction.tag);
            });

          }



        })



      }
    });
  }

}
