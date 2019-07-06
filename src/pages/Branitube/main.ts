import {pageInterface} from "./../pageInterface";

export const Branitube: pageInterface = {
    name: 'Branitube',
    domain: 'https://branitube.org',
    type: 'anime',
    isSyncPage: function(url){
      if(url.split('/')[3] !== 'assistir'){
        return false;
      }else{
        return true;
      }
    },
    sync:{
      getTitle: function(url){return j.$('.infosAtulEpisodio .nomeAnime').text();},
      getIdentifier: function(url){return utils.urlPart(url, 4);},
      getOverviewUrl: function(url){
        return Branitube.domain+'/animes/'+Branitube.sync.getIdentifier(url);
      },
      getEpisode: function(url){
        return parseInt(utils.urlPart(url, 6))
      },
      nextEpUrl: function(url){return utils.absoluteLink(j.$('[title^="Proximo Episodio"]').first().attr('href'), Branitube.domain);},
    },
    overview:{
      getTitle: function(url){return j.$('.nameAnime').text();},
      getIdentifier: function(url){return Branitube.sync.getIdentifier(url)},
      uiSelector: function(selector){ j.$('<div class="animeResult" style="margin-bottom: 10px; padding: 12px"> <p id="malp">'+selector.html()+'</p></div>').prependTo(j.$(".theUpdates .contentLastUpdatesEps").first()); },
      list:{
        offsetHandler: false,
        elementsSelector: function(){return j.$('.imgefeito > .episodio');},
        elementUrl: function(selector){return utils.absoluteLink(selector.find("a.episodioImages").first().attr('href'), Branitube.domain);},
        elementEp: function(selector){return Branitube.sync!.getEpisode(Branitube.overview!.list!.elementUrl(selector))},
      }
    },
    init(page){
      api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
      j.$(document).ready(function(){
        page.handlePage();
      });
    }
};
