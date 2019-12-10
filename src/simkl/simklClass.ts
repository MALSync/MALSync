import {entryClass} from "./../provider/Simkl/entryClass";
import {userlist} from "./../_provider/Simkl/list";
import {pageSearch} from './../pages/pages';
import * as helper from "./../provider/Simkl/helper";
import Vue from 'vue';
import malkiss from './malkiss.vue';

interface detail{
  page: "detail",
  id: number,
  malid: number,
  type: "anime"|"manga",
  malObj: undefined
}

interface bookmarks{
  page: "bookmarks",
  type: "anime"|"manga"
}

export class simklClass{
  page: any = null

  private interval;
  private interval2;
  private malkiss;

  constructor(public url:string){
    utils.urlChangeDetect(() => {
      clearInterval(this.interval);
      this.interval = utils.waitUntilTrue(function(){
        return (!$('#global_div').length || parseInt($('#global_div').css('opacity')) === 1) &&
        (!$('#tvMainTable').length || parseInt($('#tvMainTable').css('opacity')) === 1);
      }, () => {
        this.url = window.location.href;
        this.init();
      }, 1000)
    });

    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    $(document).ready(() => {
      this.init();
    });
  }

  async init(){
    con.log(this.url);

    clearInterval(this.interval2);

    if(this.url.indexOf("apps/chrome/mal-sync") > -1){
      this.authentication();
    }

    var urlpart = utils.urlPart(this.url, 3);
    var url2part = utils.urlPart(this.url, 4);
    if( (urlpart == 'anime' || urlpart == 'manga') && !isNaN(url2part)){
      var malObj = new entryClass(this.url);
      await malObj.init();

      this.page = {
        page: "detail",
        id: malObj.simklId,
        malid: malObj.id,
        type: urlpart,
        malObj: malObj,
      }
      con.log('page', this.page);

      if(!$('#malkiss').length) $('.SimklTVAboutBlockTitle, .simkltvdetailmobilesummaryinfo').after('<div id="malkiss"></div>');
      if(this.malkiss) this.malkiss.$destroy();
      this.malkiss = new Vue({
        el: "#malkiss",
        render: h => h(malkiss)
      }).$children[0];

      this.streamingUI();
      this.malToKiss();
      this.siteSearch();
      return;
    }

    if( (urlpart == 'anime' || urlpart == 'manga') && url2part === 'all'){
      this.page = {
        page: "bookmarks",
        type: urlpart
      }
      this.bookmarksAnime();
    }

    if(url2part == 'anime' || url2part == 'manga'){
      var status = utils.urlPart(this.url, 5);
      if(status === "watching"){
        this.page = {
          page: "bookmarks",
          type: url2part
        }
        this.bookmarksProfile();
      }
    }
  }

  async getMalUrl(){
    var urlpart = utils.urlPart(this.url, 3);
    if(urlpart == 'anime' || urlpart == 'manga'){
      var simklId = utils.urlPart(this.url, 4);
      return helper.simklIdToMal(simklId).then((malId)=>{
        if(!malId) return '';
        return 'https://myanimelist.net/'+urlpart+'/'+malId+'/'+utils.urlPart(this.url, 5);
      });
    }
    return '';
  }

  authentication(){
    try{
      utils.checkDoubleExecution();
    }catch(e){
      con.error(e);
    }
    try{
      var code = utils.urlParam(this.url, 'code');
      if(!code) throw 'No code found!';
      helper.call('https://api.simkl.com/oauth/token', JSON.stringify({
        "code"          : code,
        "client_id"     : helper.client_id,
        "client_secret" : "3f883e8e6cdd60d2d5e765aaf0612953f743dc77f44c422af98b38e083cf038b",
        "redirect_uri"  : "https://simkl.com/apps/chrome/mal-sync/connected/",
        "grant_type"    : "authorization_code"
      }), false, 'POST')
        .then((access_token) => {
          if(typeof access_token.error !== 'undefined' || typeof access_token.access_token === 'undefined') throw access_token;
          return api.settings.set('simklToken', access_token.access_token);
        })
        .then((access_token) => {
          $('.firstStage').addClass('HideImportant');
          $('.secondStage').removeClass('HideImportant');
          $('.secondStage .SimklTVKodiheaddesc').css('text-align', 'center');
        })
        .catch((e) => {
          ee(e);
        });

    }catch(e){
      ee(e);
    }

    function ee(e){
      con.error(e);
      $('.firstStage .SimklTVKodititletext, .secondStage .SimklTVKodititletext').text('Something went wrong');
    }

  }

  async streamingUI(){
    con.log('Streaming UI');

    var malObj = this.page.malObj;

    var streamUrl = malObj.getStreamingUrl();
    if(typeof streamUrl !== 'undefined'){
      this.malkiss.streamUrl = streamUrl;

      var resumeUrlObj = await malObj.getResumeWaching();
      var continueUrlObj = await malObj.getContinueWaching();
      con.log('Resume', resumeUrlObj, 'Continue', continueUrlObj);
      if(typeof continueUrlObj !== 'undefined' && continueUrlObj.ep === (malObj.getEpisode()+1)){
        this.malkiss.continueUrl = continueUrlObj.url;

      }else if(typeof resumeUrlObj !== 'undefined' && resumeUrlObj.ep === malObj.getEpisode()){
        this.malkiss.resumeUrl = resumeUrlObj.url;
      }
    }else{
      this.malkiss.streamUrl = null;
    }
  }

  malToKiss(){
    con.log('malToKiss');
    utils.getMalToKissArray(this.page!.type, this.page!.malid).then((links) => {
      this.malkiss.links = links;
    })
  }

  siteSearch(){
    if(!api.settings.get('SiteSearch')) return;
    con.log('PageSearch');
    var newSearch:any = [];

    var title = $('h1').first().text().trim();
    var titleEncoded = encodeURI(title!);


    for (var key in pageSearch) {
      var page = pageSearch[key];

      if(page.type !== this.page!.type) continue;

      var tempAdd = {
        favicon: utils.favicon(page.domain),
        name: page.name,
        search: '',
        googleSeach: ''
      }


      if( typeof page.completeSearchTag === 'undefined'){
        tempAdd.search = page.searchUrl(titleEncoded);
      }

      var googleSeach = '';
      if( typeof page.googleSearchDomain !== 'undefined'){
        tempAdd.googleSeach = `https://www.google.com/search?q=${titleEncoded}+site:${page.googleSearchDomain}`;
      }
      newSearch.push(tempAdd);
    }

    this.malkiss.pageSearch = newSearch;
  }

  bookmarksProfile(){
    var listProvider = new userlist(1, this.page!.type);

    listProvider.get().then( (list) => {
      $.each(list, async (index, en) => {
        con.log('en', en);
        var element = $('a[href^="/'+this.page!.type+'/'+en.uid+'"]');
        if(!element || element.hasClass('malSyncDone2')) return;
        element.addClass('malSyncDone2');
        var streamUrl = utils.getUrlFromTags(en.tags);
        if(typeof streamUrl !== 'undefined'){
          con.log(streamUrl);
          element.after(`
            <a class="mal-sync-stream mal-rem" onclick="event.stopPropagation();" title="${streamUrl.split('/')[2]}" target="_blank" style="display: inline-block; height: 0; position: relative; top: -11px; margin-left: 5px;" href="${streamUrl}">
              <img src="${utils.favicon(streamUrl.split('/')[2])}">
            </a>`);

          var resumeUrlObj = await utils.getResumeWaching(this.page!.type, en.cacheKey);
          var continueUrlObj = await utils.getContinueWaching(this.page!.type, en.cacheKey);

          var curEp = en.watchedEp;

          con.log('Resume', resumeUrlObj, 'Continue', continueUrlObj);
          if(typeof continueUrlObj !== 'undefined' && continueUrlObj.ep === (curEp+1)){
            element.parent().append(
              `<a class="nextStream mal-rem" onclick="event.stopPropagation();" title="Continue watching" target="_blank" style="display: inline-block; height: 0; position: relative; top: -11px; margin-left: 5px; color: #BABABA;" href="${continueUrlObj.url}">
                <img src="${api.storage.assetUrl('double-arrow-16px.png')}" width="16" height="16">
              </a>`
              );
          }else if(typeof resumeUrlObj !== 'undefined' && resumeUrlObj.ep === curEp){
            element.parent().append(
              `<a class="resumeStream mal-rem" onclick="event.stopPropagation();" title="Resume watching" target="_blank" style="display: inline-block; height: 0; position: relative; top: -11px; margin-left: 5px; color: #BABABA;" href="${resumeUrlObj.url}">
                <img src="${api.storage.assetUrl('arrow-16px.png')}" width="16" height="16">
              </a>`
              );
          }



        }
      });
    }).catch((e) => {
      con.error(e);
      listProvider.flashmError(e);
    });
  }

  bookmarksAnime(){
    var This = this;

    var listProvider = new userlist(1, this.page!.type);

    listProvider.get().then( (list) => {
      exec();

      this.interval2 = utils.changeDetect(() => {
        exec();
      }, () => {
        return $('#tv_best_left_addContainer li').length + $('#tv_best_left_addContainer > div').height()!;
      });

      function exec(){
        con.info('list');
        $.each(list, async (index, en) => {
          var element = $('#c'+en.uid);
          if(!element || !element.length || element.hasClass('malSyncDone2')) return;
          element.addClass('malSyncDone2').css('position', 'relative');
          var streamUrl = utils.getUrlFromTags(en.tags);
          if(typeof streamUrl !== 'undefined'){
            con.log(streamUrl);
            element.append(`
              <a class="mal-sync-stream mal-rem" onclick="event.stopPropagation();" title="${streamUrl.split('/')[2]}" target="_blank" style="position: absolute; z-index: 10; right: 0; top: 0; background-color: #00000057; padding: 5px;" href="${streamUrl}">
                <img src="${utils.favicon(streamUrl.split('/')[2])}">
              </a>`);

            var resumeUrlObj = await utils.getResumeWaching(This.page!.type, en.cacheKey);
            var continueUrlObj = await utils.getContinueWaching(This.page!.type, en.cacheKey);

            var curEp = en.watchedEp;

            con.log('Resume', resumeUrlObj, 'Continue', continueUrlObj);
            if(typeof continueUrlObj !== 'undefined' && continueUrlObj.ep === (curEp+1)){
              element.append(
                `<a class="nextStream mal-rem" onclick="event.stopPropagation();" title="Continue watching" target="_blank" style="position: absolute; z-index: 10; right: 0; top: 26px; background-color: #00000057; padding: 5px;" href="${continueUrlObj.url}">
                  <img src="${api.storage.assetUrl('double-arrow-16px.png')}" width="16" height="16">
                </a>`
                );
            }else if(typeof resumeUrlObj !== 'undefined' && resumeUrlObj.ep === curEp){
              element.append(
                `<a class="resumeStream mal-rem" onclick="event.stopPropagation();" title="Resume watching" target="_blank" style="position: absolute; z-index: 10; right: 0; top: 26px; background-color: #00000057; padding: 5px;" href="${resumeUrlObj.url}">
                  <img src="${api.storage.assetUrl('arrow-16px.png')}" width="16" height="16">
                </a>`
                );
            }



          }
        });
      }
    }).catch((e) => {
      con.error(e);
      listProvider.flashmError(e);
    });
  }

}
