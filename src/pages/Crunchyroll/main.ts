import {pageInterface} from "./../pageInterface";
export const Crunchyroll: pageInterface = {
    name: 'Crunchyroll',
    domain: 'https://www.crunchyroll.com',
    database: 'Crunchyroll',
    type: 'anime',
    isSyncPage: function(url){
      if(typeof url.split('/')[4] != 'undefined'){
        if(j.$('#showmedia_video').length){
          return true;
        }
      }
      return false;
    },
    sync:{
      getTitle: function(url){return Crunchyroll.sync.getIdentifier(urlHandling(url))},
      getIdentifier: function(url){
        var jsOn = JSON.parse(j.$('script[type="application/ld+json"]').first().html());
        return jsOn.partOfSeason.name;
      },
      getOverviewUrl: function(url){return urlHandling(url).split('/').slice(0,4).join('/') + '?season=' + Crunchyroll.sync.getIdentifier(urlHandling(url));},
      getEpisode: function(url){
        return episodeHelper(url, j.$('h1.ellipsis').text().replace( j.$('h1.ellipsis > a').text(), '').trim());
      },
      nextEpUrl: function(url){
        var nextEp = j.$('.collection-carousel-media-link-current').parent().next().find('.link').attr('href');
        if(!nextEp) return nextEp;
        return Crunchyroll.domain + nextEp;
      }
    },
    overview:{
      getTitle: function(url){return Crunchyroll.overview!.getIdentifier(urlHandling(url))},
      getIdentifier: function(url){
        if( j.$('.season-dropdown').length > 1){
          throw new Error('MAL-Sync does not support multiple seasons');
        }else{
          if(j.$('.season-dropdown').length){
            return j.$('.season-dropdown').first().text();
          }else{
            return j.$('#showview-content-header h1 span').first().text();
          }
        }
      },
      uiSelector: function(selector){selector.insertBefore(j.$("#tabs").first());},
      list:{
        offsetHandler: true,
        elementsSelector: function(){return j.$("#showview_content_videos .list-of-seasons .group-item a");},
        elementUrl: function(selector){return utils.absoluteLink(selector.attr('href'), Crunchyroll.domain);},
        elementEp: function(selector){
          var url = Crunchyroll.overview!.list!.elementUrl(selector);
          return episodeHelper(urlHandling(url), selector.find('.series-title').text().trim());
        },
      }
    },
    init(page){
      if(document.title == "Just a moment..."){
          con.log("loading");
          page.cdn();
          return;
      }
      api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());

      page.setCacheTemp = page.setCache;
      page.setCache = function(url, toDatabase:boolean|'correction', identifier:any = null){
        if(this.page.isSyncPage(this.url)){
          this.setCacheTemp(url, toDatabase, identifier);
        }
      }
      page.databaseRequestTemp = page.databaseRequest;
      page.databaseRequest = function(malurl, toDatabase:boolean|'correction', identifier, kissurl = null){
        this.databaseRequestTemp(malurl, toDatabase, identifier, this.url+'?..'+encodeURIComponent(identifier.toLowerCase().split('#')[0]).replace(/\./g, '%2E'))
      }

      j.$(document).ready(function(){
        if( j.$('.season-dropdown').length > 1){
          j.$('.season-dropdown').append('<span class="exclusivMal" style="float: right; margin-right: 20px; color: #0A6DA4;" onclick="return false;">MAL</span>');
          j.$('.exclusivMal').click(function(evt){
            j.$('#showview_content').before('<div><a href="'+page.url.split('?')[0]+'">Show hidden seasons</a></div>');
            var thisparent =  j.$(evt.target).parent();
            j.$('.season-dropdown').not(thisparent).siblings().remove();
            j.$('.season-dropdown').not(thisparent).remove();
            j.$('.portrait-grid').css('display','block').find("li.group-item img.landscape").each(function() {
              // @ts-ignore
              void 0 === j.$(this).attr("src") && j.$(this).attr("src", j.$(this).attr("data-thumbnailUrl"))
            }),
            j.$('.exclusivMal').remove();
            page.handlePage();
          });
          var season = new RegExp('[\?&]' + 'season' + '=([^&#]*)').exec(page.url);
          if(season != null){
            // @ts-ignore
            season = season[1] || null;
            if(season != null){
              // @ts-ignore
              season = decodeURIComponent(decodeURI(season));
              j.$('.season-dropdown[title="'+season+'" i] .exclusivMal').first().click();
            }
          }
          return;
        }else{
          if(
            (
              j.$('.header-navigation ul .state-selected').length
              && !j.$('.header-navigation ul .state-selected').first().index()
            )
            || j.$('#showmedia_video').length
          ) {
            page.handlePage();
          }else{
            con.info('No anime page');
          }

        }
      });
    }
};

function urlHandling(url){
  var langslug = j.$('#home_link, #logo_beta a').first().attr('href');
  if(langslug == '/'){
    return url;
  }else{
    return url.replace(langslug, '');
  }

}

function episodeHelper(url, episodeText){
  var episodePart = utils.urlPart(urlHandling(url), 4);
  try{
    if(/\d+\.\d+/.test(episodeText)){
      episodePart = 'episode'+episodeText.match(/\d+\.\d+/)[0];
    }
  }catch(e){
    con.error(e);
  }
  var temp = [];
  temp = episodePart.match(/[e,E][p,P][i,I]?[s,S]?[o,O]?[d,D]?[e,E]?\D?\d+/);
  if(temp !== null){
    episodePart = temp[0];
  }else{
    episodePart = '';
  }
  temp = episodePart.match(/\d+/);
  if(temp === null){
    episodePart = 1;
  }else{
    episodePart = temp[0];
  }
  return episodePart;
}
