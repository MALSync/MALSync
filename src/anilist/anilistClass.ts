import * as helper from "./../provider/AniList/helper";
import {entryClass} from "./../provider/AniList/entryClass";
import {userList} from "./../provider/AniList/userList";

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
    utils.changeDetect(() => {
      this.url = window.location.href;
      this.init();
    }, function(){
      return $('meta[property="og:url"]').attr('content');
    });
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
              Token saved you can close this page now
            </div>
          `);
        });
      });
    }
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
        $('.sidebar .data').before(html);
        $('.remove-mal-sync').click(function(){
          var key = $(this).attr('title');
          api.settings.set(key, false);
          location.reload();
        });
      });
    })
  }

  async streamingUI(){
    con.log('Streaming UI');
    $('#mal-sync-stream-div').remove();
    var malObj = new entryClass(this.url);
    await malObj.init();

    var streamUrl = malObj.getStreamingUrl();
    if(typeof streamUrl !== 'undefined'){

      $(document).ready(async function(){
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
            `<a class="nextStream" title="Continue watching" target="_blank" style="margin: 0 5px 0 0; color: #BABABA;" href="${continueUrlObj.url}">
              <img src="${api.storage.assetUrl('double-arrow-16px.png')}" width="16" height="16">
            </a>`
            );
        }else if(typeof resumeUrlObj !== 'undefined' && resumeUrlObj.ep === malObj.getEpisode()){
          $('#mal-sync-stream-div').append(
            `<a class="resumeStream" title="Resume watching" target="_blank" style="margin: 0 5px 0 0; color: #BABABA;" href="${resumeUrlObj.url}">
              <img src="${api.storage.assetUrl('arrow-16px.png')}" width="16" height="16">
            </a>`
            );
        }

      });
    }
  }

  bookmarks(){
    $(document).ready(() => {
      $('.mal-rem, .mal-sync-ep-pre').remove();
      $('.list-entries .entry, .list-entries .entry-card').each((index, el) => {
        var streamUrl = utils.getUrlFromTags($(el).find('.notes').first().attr('label'));
        if(typeof streamUrl !== 'undefined'){
          con.log(streamUrl);
          $(el).find('.title a').first().after(`
            <a class="mal-sync-stream mal-rem" title="${streamUrl.split('/')[2]}" target="_blank" style="margin: 0 0; max-height: 14px;" href="${streamUrl}">
              <img src="${utils.favicon(streamUrl.split('/')[2])}">
            </a>`);
        }

      })

      userList(1, this.page!.type, {anilist: true, fullListCallback: (list) => {
        con.log(list);
        $.each(list, async (index, en) => {
          con.log('en', en);
          if(typeof en.malid !== 'undefined' && en.malid !== null && en.malid){
            var element = $('a[href^="/'+this.page!.type+'/'+en.id+'/"]').first().parent();

            var resumeUrlObj = await utils.getResumeWaching(this.page!.type, en.malid);
            var continueUrlObj = await utils.getContinueWaching(this.page!.type, en.malid);

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

            utils.epPredictionUI(en.malid, this.page!.type, (prediction) => {
              element.parent().find('.progress').append(prediction.tag);
            });

          }



        })



      }});
    });
  }

}
