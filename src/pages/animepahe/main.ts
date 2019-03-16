import {pageInterface} from "./../pageInterface";

 export const animepahe: pageInterface = {
    name: 'animepahe',
    domain: 'https://animepahe.com',
    database: 'animepahe',
    type: 'anime',
    isSyncPage: function(url){
      if(url.split('/')[3] !== 'play'){
        return false;
      }else{
        return true;
      }
    },
    sync:{
      getTitle: function(url){return j.$('.theatre-info h1 a').first().text()},
      getIdentifier: function(url){return utils.urlPart(url, 4);},
      getOverviewUrl: function(url){
        return animepahe.domain+'/anime/'+animepahe.sync.getIdentifier(url);
        },
      getEpisode: function(url){
        return j.$('.theatre-info h1')[0].childNodes[2].textContent.replace(/[^0-9\.]+/g, '')
      },
      nextEpUrl: function(url){return animepahe.domain+'/'+j.$('.sequel a').first().attr('href');},
      uiSelector: function(selector){selector.insertAfter(j.$(".anime-season"));},
    },
    overview:{
      getTitle: function(url){return animepahe.sync.getTitle(url);},
      getIdentifier: function(url){return animepahe.sync.getIdentifier(url)},
      uiSelector: function(selector){ animepahe.sync!.uiSelector!(selector)}
    },
    init(page){
      api.storage.addStyle(require('./style.less').toString());
      j.$(document).ready(function(){
        page.handlePage();
      });
    }
};
