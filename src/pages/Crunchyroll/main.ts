import {pageInterface} from "./../pageInterface";
//TODO: Add mal2kiss season argument
export const Crunchyroll: pageInterface = {
    name: 'Crunchyroll',
    domain: 'http://www.crunchyroll.com',
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
      getTitle: function(url){return Crunchyroll.sync.getIdentifier(url)},
      getIdentifier: function(url){
        var script = (j.$("#template_body script")[1]).innerHTML;
        script = script.split('mediaMetadata =')[1].split('"name":"')[1].split(' -')[0];
        script = JSON.parse('"' + script.replace('"', '\\"') + '"');
        return script;
      },
      getOverviewUrl: function(url){return url.split('/').slice(0,4).join('/');},
      getEpisode: function(url){
        var episodePart = utils.urlPart(url, 4);
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
      },
      nextEpUrl: function(url){return Crunchyroll.domain+j.$('.collection-carousel-media-link-current').parent().next().find('.link').attr('href');}
    },
    overview:{
      getTitle: function(url){return Crunchyroll.overview!.getIdentifier(url)},
      getIdentifier: function(url){
        if( j.$('.season-dropdown').length > 1){
          throw new Error('MAL-Sync does not support multiple seasons');
        }else{
          if(j.$('.season-dropdown').length){
            return j.$('.season-dropdown').first().text();
          }else{
            return j.$('#source_showview h1 span').text();
          }
        }
      },
      uiSelector: function(selector){selector.insertBefore(j.$("#tabs").first());},
      list:{
        elementsSelector: function(){return j.$("#showview_content_videos .list-of-seasons .group-item a");},
        elementUrl: function(selector){return utils.absoluteLink(selector.attr('href'), Crunchyroll.domain);},
        elementEp: function(selector){
          var url = Crunchyroll.overview!.list!.elementUrl(selector);
          return Crunchyroll.sync.getEpisode(url);
        },
      }
    },
    init(page){
      api.storage.addStyle(require('./style.less').toString());

      page.setCacheTemp = page.setCache;
      page.setCache = function(url, toDatabase:boolean|'correction', identifier:any = null){
        if(this.page.isSyncPage(this.url)){
          this.setCacheTemp(url, toDatabase, identifier);
        }
      }
      page.databaseRequestTemp = page.databaseRequest;
      page.databaseRequest = function(malurl, toDatabase:boolean|'correction', identifier, kissurl = null){
        this.databaseRequestTemp(malurl, toDatabase, identifier, this.url+'?..'+identifier)
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
          page.handlePage();
        }
      });
    }
};
