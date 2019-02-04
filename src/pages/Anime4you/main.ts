import {pageInterface} from "./../pageInterface";

export const Anime4you: pageInterface = {
    name: 'Anime4you',
    domain: 'https://www.anime4you.one',
    database: 'Anime4you',
    type: 'anime',
    isSyncPage: function(url){
      if(url.split('/')[7] !== 'epi'){
        return false;
      }else{
        return true;
      }
    },
    sync:{
      getTitle: function(url){return j.$('.titel').text().trim();},
      getIdentifier: function(url){return parseInt(utils.urlPart(url, 6)).toString();},
      getOverviewUrl: function(url){
        return Anime4you.domain+'/show/1/aid/'+Anime4you.sync.getIdentifier(url);
        },
      getEpisode: function(url){
        return parseInt(utils.urlPart(url, 8))
      },
      nextEpUrl: function(url){return Anime4you.domain+j.$('.vidplayer .forward a').first().attr('href');},
      uiSelector: function(selector){selector.insertAfter(j.$("#beschreibung > p").first());},
    },
    overview:{
      getTitle: function(url){return Anime4you.sync.getTitle(url);},
      getIdentifier: function(url){return Anime4you.sync.getIdentifier(url)},
      uiSelector: function(selector){ Anime4you.sync!.uiSelector!(selector)},
      list:{
        offsetHandler: false,
        elementsSelector: function(){return j.$('.episoden li');},
        elementUrl: function(selector){return utils.absoluteLink(selector.find("a").first().attr('href'), Anime4you.domain);},
        elementEp: function(selector){return Anime4you.sync!.getEpisode(Anime4you.overview!.list!.elementUrl(selector))},
      }
    },
    init(page){
      if(document.title == "Please wait 5 seconds..."){
          con.log("loading");
          page.cdn();
          return;
      }
      api.storage.addStyle(require('./style.less').toString());
      j.$(document).ready(function(){
        page.handlePage();
      });
    }
};
