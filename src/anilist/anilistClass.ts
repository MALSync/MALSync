import * as helper from "./../provider/AniList/helper";

interface detail{
  page: "detail",
  id: number,
  malid: number,
  type: "anime"|"manga"
}

export class anilistClass{
  page: null|detail = null

  constructor(public url:string){
    utils.urlChangeDetect(() => {
      this.url = window.location.href;
      this.init();
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
      helper.aniListToMal(this.page.id, this.page.type).then((malid)=>{
        this.page!.malid = malid;
        con.log('page', this.page);
        this.malToKiss();
      });
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
            <span title="${pageKey}" class="remove-mal-sync" style="float: right; cursor: pointer; color: grey;">x</span>
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

}
