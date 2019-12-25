import {pageInterface} from "./../pageInterface";

export const Branitube: pageInterface = {
    name: 'Branitube',
    domain: 'https://branitube.net',
    type: 'anime',
    isSyncPage: function(url){
      if(url.split('/')[3] !== 'watch'){
        return false;
      }else{
        return true;
      }
    },
    sync:{
      getTitle: function(url){return j.$('div.episodeInfo > div.nomeAnime').text();},
      getIdentifier: function(url){return utils.urlPart(url, 5);},
      getOverviewUrl: function(url){
        return Branitube.domain+$('div.buttonEpisodes > a').first().attr('href')!;
      },
      getEpisode: function(url){
        return parseInt(toEp($('div.episodeInfo > div.epInfo').text().trim()));
      },
      nextEpUrl: function(url){return utils.absoluteLink(j.$('div.controlVideos > ul > li:nth-child(3) > a').first().attr('href'), Branitube.domain);},
    },
    overview:{
      getTitle: function(url){return j.$('div.animeInfos > ul > li.largeSize').text();},
      getIdentifier: function(url){return utils.urlPart(url, 5);},
      uiSelector: function(selector){ j.$('<div class="animeResult" style="margin-bottom: 10px; padding: 12px"> <p id="malp">'+selector.html()+'</p></div>').prependTo(j.$(".theUpdates .contentLastUpdatesEps").first()); },
      list:{
        offsetHandler: false,
        elementsSelector: function(){return j.$('.imgefeito > .episodio');},
        elementUrl: function(selector){return utils.absoluteLink(selector.find("a.episodioImages").first().attr('href'), Branitube.domain);},
        elementEp: function(selector){return parseInt(toEp(selector.find('.numeroEpisodio').first().text().trim()))},
      }
    },
    init(page){
      api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
      j.$(document).ready(function(){
        page.handlePage();
      });
    }
};

function toEp(string){
  var temp = string.match(/\d*$/);
  if(temp !== null){
      return temp[0];
  }
  return 1;
}
