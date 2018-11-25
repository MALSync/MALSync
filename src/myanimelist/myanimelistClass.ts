import {pageSearch} from './../pages/pages';
import {mal} from "./../utils/mal";

export class myanimelistClass{
  page: "detail"|"bookmarks"|"modern"|"classic"|"character"|"people"|"search"|null = null;

  //detail
  readonly id: number|null = null;
  readonly type: "anime"|"manga"|null = null;

  //bookmarks
  readonly username: any = null;


  constructor(public url:string){
    if(url.indexOf("myanimelist.net/anime.php") > -1){
      var urlTemp = '/anime/'+utils.urlParam(this.url, 'id');
      // @ts-ignore
      window.history.replaceState(null, null, urlTemp);
      this.url = utils.absoluteLink(urlTemp, 'https://myanimelist.net');
    }
    if(url.indexOf("myanimelist.net/manga.php") > -1){
      var urlTemp = '/manga/'+utils.urlParam(this.url, 'id');
      // @ts-ignore
      window.history.replaceState(null, null, urlTemp);
      this.url = utils.absoluteLink(urlTemp, 'https://myanimelist.net');
    }

    var urlpart = utils.urlPart(this.url, 3);
    if(urlpart == 'anime' || urlpart == 'manga'){
      this.page = 'detail';
      this.id = utils.urlPart(this.url, 4);
      this.type = urlpart;
    }
    if(urlpart == 'animelist' || urlpart == 'mangalist'){
      this.page = 'bookmarks';
      this.type = urlpart.substring(0, 5);
      this.username = utils.urlPart(this.url, 4);
    }
    if(urlpart == 'character'){
      this.page = 'character';
    }
    if(urlpart == 'people'){
      this.page = 'people';
    }
    if(urlpart == 'search'){
      this.page = 'search';
    }
  }

  init(){
    con.log(this);
    switch(this.page) {
      case 'detail':
        this.thumbnails();
        this.setEpPrediction();
        this.streamingUI();
        this.malToKiss();
        this.siteSearch();
        this.related()
        setInterval(() => {
          this.setEpPrediction();
        }, 1000 * 60)
        break;
      case 'bookmarks':
        var This = this;
        $(document).ready(function(){
          if($('#mal_cs_powered').length){
            This.page = 'classic';
          }else{
            This.page = 'modern';
          }
          This.init();
        });
        break;
      case 'modern':
        this.bookmarks();
        break;
      case 'classic':
        this.bookmarks();
        break
      case 'character':
      case 'people':
        this.relatedTag();
      case 'search':
        this.thumbnails();
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

  bookmarksHDimages(){
    var tags = document.querySelectorAll('img[src*="/96x136/"]');
    for (var i = 0; i < tags.length; i++) {
      var regexDimensions = /\/r\/\d*x\d*/g;
      var url = tags[i].getAttribute("src")!;
      tags[i].setAttribute("src", url.replace(regexDimensions, ''));
    }
  }

  setEpPrediction(){
    con.log('setEpPrediction');
    utils.epPredictionUI(this.id, function(prediction){
      con.log(prediction);
      $('.mal-sync-pre-remove, .mal-sync-ep-pre').remove();
      $('#addtolist').prev().before('<div class="mal-sync-pre-remove">'+prediction.text+'</div>');
      $('[id="curEps"]').before(prediction.tag+' ');
    });
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
        html += '<h2 id="'+pageKey+'Links" class="mal_links"><img src="'+utils.favicon(tempUrl.split('/')[2])+'"> '+pageKey+'</h2>';
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
      $('h2:contains("Information")').before('<h2 id="mal-sync-search-links" class="mal_links">Search</h2><div class="MALSync-search"><a>[Show]</a></div><br class="mal_links" />');
      api.storage.addStyle('#AniList.mal_links img{background-color: #898989;}');
      $('#mal-sync-search-links, .MALSync-search').one('click', () => {
        $('.MALSync-search').remove();
        var title = $('#contentWrapper > div:first-child span').text()
        var titleEncoded = encodeURI(title);
        var html = '';
        var imgStyle = 'position: relative; top: 4px;'

        for (var key in pageSearch) {
          var page = pageSearch[key];
          if(page.type !== This.type) continue;

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

        $('#mal-sync-search-links').after(html);
      });
    });
  }

  async streamingUI(){
    con.log('Streaming UI');
    var malObj = new mal(this.url);
    await malObj.init();

    var streamUrl = malObj.getStreamingUrl();
    if(typeof streamUrl !== 'undefined'){

      $(document).ready(async function(){
        $('.h1 span').first().after(`
        <div class="data title progress" id="mal-sync-stream-div" style="display: inline-block; position: relative; top: 2px;">
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
    con.log('Bookmarks ['+this.username+']['+this.page+']');
    var This = this;

    if(this.page == 'modern'){
      var book = {
        bookReady: function(callback){
          utils.waitUntilTrue(function(){return $('#loading-spinner').css('display') == 'none'}, function(){
            callback($.parseJSON($('.list-table').attr('data-items')!));
          });
        },
        getElement: function(malUrl){
          return $('.list-item a[href^="'+malUrl+'"]').parent().parent('.list-table-data');
        },
        streamingSelector: '.data.title .link',
        cleanTags: function(){
          $('.tags span a').each(function( index ) {
            if(typeof utils.getUrlFromTags($(this).text()) !== 'undefined'){
              $(this).parent().remove();
            }
          });
        },
        predictionPos(element, tag){
          element.find('.data.progress span').first().after(tag);
        },
      }
    }else if(this.page == 'classic'){
      var book = {
        bookReady: function(callback){
          utils.getUserList(7, This.type, null, null, function(list){
            callback(list);
          }, null, This.username);
        },
        getElement: function(malUrl){
          return $('a[href^="'+malUrl+'"]');
        },
        streamingSelector: 'span',
        cleanTags: function(){
          $('span[id^="tagLinks"] a').each(function( index ) {
            if(typeof utils.getUrlFromTags($(this).text()) !== 'undefined'){
              $(this).remove();
            }
          });
        },
        predictionPos(element, tag){
          element.parent().parent().find('span[id^="epText"] a span').first().after(tag);
        },
      }
    }else{
      con.error('Bookmark type unknown')
      return
    }

    book.bookReady(function(data){
      This.bookmarksHDimages();
      $.each(data, async function(index, el) {
        var streamUrl = utils.getUrlFromTags(el['tags']);
        var malUrl = el[This.type+'_url'];
        con.log(malUrl);
        var id = utils.urlPart(malUrl, 2);
        var type = utils.urlPart(malUrl, 1);

        if(typeof streamUrl !== 'undefined'){
          var element = book.getElement(malUrl);
          element.find(book.streamingSelector).after(`
            <a class="mal-sync-stream" title="${streamUrl.split('/')[2]}" target="_blank" style="margin: 0 0;" href="${streamUrl}">
              <img src="${utils.favicon(streamUrl.split('/')[2])}">
            </a>`);

          var resumeUrlObj = await utils.getResumeWaching(type, id);
          var continueUrlObj = await utils.getContinueWaching(type, id);

          if(This.type == 'anime'){
            var curEp = parseInt(el['num_watched_episodes']);
          }else{
            var curEp = parseInt(el['num_read_chapters']);
          }

          con.log('Resume', resumeUrlObj, 'Continue', continueUrlObj);
          if(typeof continueUrlObj !== 'undefined' && continueUrlObj.ep === (curEp+1)){
            element.find('.mal-sync-stream').after(
              `<a class="nextStream" title="Continue watching" target="_blank" style="margin: 0 5px 0 0; color: #BABABA;" href="${continueUrlObj.url}">
                <img src="${api.storage.assetUrl('double-arrow-16px.png')}" width="16" height="16">
              </a>`
              );
          }else if(typeof resumeUrlObj !== 'undefined' && resumeUrlObj.ep === curEp){
            element.find('.mal-sync-stream').after(
              `<a class="resumeStream" title="Resume watching" target="_blank" style="margin: 0 5px 0 0; color: #BABABA;" href="${resumeUrlObj.url}">
                <img src="${api.storage.assetUrl('arrow-16px.png')}" width="16" height="16">
              </a>`
              );
          }

        }

        utils.epPredictionUI(id, function(prediction){
          var element = book.getElement(malUrl);
          book.predictionPos(element, prediction.tag);
        });

      });
      book.cleanTags();
    });
  }

  related(){
    $(document).ready(function(){
      $('.anime_detail_related_anime a').each(function(){
        var el = $(this);
        var url = utils.absoluteLink(el.attr('href'), 'https://myanimelist.net');
        if(typeof url != 'undefined'){
          var malObj = new mal(url);
          malObj.init().then(() => {
            var tag = utils.statusTag(malObj.getStatus(), malObj.type, malObj.id);
            if(tag){
              el.after(tag)
            }
          });
        }
      })
    });
  }

  relatedTag(){
    $(document).ready(function(){
      $('a.button_edit').each(function(){
        var el = $(this);
        var href = $(this).attr('href');
        var type =  utils.urlPart(href, 4);
        var id = utils.urlPart(href, 5);
        var state = el.attr('title');
        if(typeof state != 'undefined' && state){
          var tag = utils.statusTag(state, type, id);
          el.parent().parent().find('> a').after(tag);
          el.remove();
        }
      });
    });
  }

}
