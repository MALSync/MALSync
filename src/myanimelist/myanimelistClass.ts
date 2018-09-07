import {pageSearch} from './../pages/pages';

export class myanimelistClass{
  readonly page: "detail"|null = null;

  //detail
  readonly id: number|null = null;
  readonly type: "anime"|"manga"|null = null;


  constructor(public url:string){
    var urlpart = utils.urlPart(url, 3);
    if(urlpart == 'anime' || urlpart == 'manga'){
      this.page = 'detail';
      this.id = utils.urlPart(url, 4);
      this.type = urlpart;
    }
  }

  init(){
    con.log(this);
    switch(this.page) {
      case 'detail':
        this.thumbnails();
        this.malToKiss();
        this.siteSearch();
        break;
      default:
        con.log('This page has no scipt')
    }
  }

  thumbnails(){
    con.log('Lazyloaded Images')
    if(this.url.indexOf("/pics") > -1){
      return;
    }
    if(this.url.indexOf("/pictures") > -1){
      return;
    }
    if(api.settings.get('malThumbnail') == "0"){
      return;
    }
    var height = parseInt(api.settings.get('malThumbnail'));
    var width = Math.floor(height/144*100);

    var surHeight = height+4;
    var surWidth = width+4;
    api.storage.addStyle('.picSurround img:not(.noKal){height: '+height+'px !important; width: '+width+'px !important;}');
    api.storage.addStyle('.picSurround img.lazyloaded.kal{width: auto !important;}');
    api.storage.addStyle('.picSurround:not(.noKal) a{height: '+surHeight+'px; width: '+surWidth+'px; overflow: hidden; display: flex; justify-content: center;}');

    var loaded = 0;
    try{
      // @ts-ignore
      $(window).load(function(){ overrideLazyload(); });
    }catch(e){
      con.info(e);
    }
    try{
      window.onload = function(){ overrideLazyload(); };
    }catch(e){
      con.info(e);
    }
    try{
      document.onload = function(){ overrideLazyload(); };
    }catch(e){
      con.info(e);
    }
    try{
      $(document).ready(function(){ overrideLazyload(); });
    }catch(e){
      con.info(e);
    }

    function overrideLazyload() {
      if(loaded) return;
      loaded = 1;
      var tags = document.querySelectorAll(".picSurround img:not(.kal)");
      var url = '';
      for (var i = 0; i < tags.length; i++) {
        var regexDimensions = /\/r\/\d*x\d*/g;
        if(tags[i].hasAttribute("data-src")){
          url = tags[i].getAttribute("data-src")!;
        }else{
          url = tags[i].getAttribute("src")!;
        }

        if ( regexDimensions.test(url) || /voiceactors.*v.jpg$/g.test(url) ) {
          if(!(url.indexOf("100x140") > -1)){
            tags[i].setAttribute("data-src", url);
            url = url.replace(/v.jpg$/g, '.jpg');
            tags[i].setAttribute("data-srcset", url.replace(regexDimensions, ''));
            tags[i].classList.add('lazyload');
          }
          tags[i].classList.add('kal');
        }else{
          tags[i].closest(".picSurround")!.classList.add('noKal');
          tags[i].classList.add('kal');
          tags[i].classList.add('noKal');
        }
      }
    }
  }

  async malToKiss(){
    con.log('malToKiss');
    utils.getMalToKissArray(this.type, this.id).then((links) => {
      var html = '';
      for(var pageKey in links){
        var page = links[pageKey];

        var tempHtml = '';
        var tempUrl = '';
        for(var streamKey in page){
          var stream = page[streamKey];
          tempHtml += '<div class="mal_links"><a target="_blank" href="'+stream['url']+'">'+stream['title']+'</a></div>';
          tempUrl = stream['url'];
        }
        html += '<h2 id="'+pageKey+'Links" class="mal_links"><img src="https://www.google.com/s2/favicons?domain='+tempUrl.split('/')[2]+'"> '+pageKey+'</h2>';
        html += tempHtml;
        html += '<br class="mal_links" />';

      }
      $(document).ready(function(){
        $('h2:contains("Information")').before(html);
      });
    })
  }

  siteSearch(){
    var This = this;
    $(document).ready(function(){
      con.log('Site Search');
      $('h2:contains("Information")').before('<h2 id="mal-sync-search-links" class="mal_links">Search</h2><br class="mal_links" />');
      $('#mal-sync-search-links').one('click', () => {
        var title = $('#contentWrapper > div:first-child span').text()
        var titleEncoded = encodeURI(title);
        var html = '';

        for (var key in pageSearch) {
          var page = pageSearch[key];
          if(page.type !== This.type) continue;

          var linkContent = `${page.name} <img src="https://www.google.com/s2/favicons?domain=${page.domain}">`;
          if( typeof page.completeSearchTag === 'undefined'){
            var link =
            `<a target="_blank" href="${page.searchUrl(titleEncoded)}">
              ${linkContent}
            </a>`
          }else{
            var link = page.completeSearchTag(title, linkContent);
          }
          html +=
          `<div class="mal_links">
              ${link}
            <a target="_blank" href="https://www.google.com/search?q=${titleEncoded}+site:${page.domain}">
              <img src="https://www.google.com/s2/favicons?domain=google.com">
            </a>
          </div>`;
        }

        $('#mal-sync-search-links').after(html);
      });
    });
  }
}
