import {pageInterface} from "./../pageInterface";

export const animeflv: pageInterface = {
    name: 'animeflv',
    domain: 'https://animeflv.net',
    type: 'anime',
    isSyncPage: function(url){ //Funciona
      if(j.$('h2.SubTitle').length){
        return true;
      }
      return false;
    },
    sync:{
      getTitle: function(url){return j.$('h1.Title').text().split(' Episodio')[0].trim();}, //Funciona
      getIdentifier: function(url){return utils.urlPart(animeflv.domain+j.$(".fa-th-list").attr('href'), 4)+'/'+utils.urlPart(animeflv.domain+j.$(".fa-th-list").attr('href'), 5);}, //Funciona
      getOverviewUrl: function(url){return animeflv.domain+j.$(".fa-th-list").attr('href');}, //Funciona
      getEpisode: function(url){return parseInt(j.$('h2.SubTitle').text().replace('Episodio ', '').trim());}, //Funciona
      nextEpUrl: function(url){return animeflv.domain+j.$(".fa-chevron-right").attr('href');}, //Funciona
      uiSelector: function(selector){selector.insertAfter(j.$(".CapOptns"));}, //Funciona
    },
    overview:{
      getTitle: function(url){return j.$('h2.Title').text();}, //Funciona
      getIdentifier: function(url){return utils.urlPart(url, 4)+'/'+utils.urlPart(url, 5);}, //Funciona
      uiSelector: function(selector){selector.insertAfter(j.$(".Description"));}, //Funciona
      list:{ //Bug no carga todos los episodios, si hay muchos
        offsetHandler: false,
        elementsSelector: function(){return j.$(".ListCaps a");},
        elementUrl: function(selector){return utils.absoluteLink(selector.attr('href'), animeflv.domain);},
        elementEp: function(selector){return selector.find('p').first().text().replace('Episodio ','').trim();},
      }
    },
    init(page){
      api.storage.addStyle(require('./style.less').toString());
      j.$(document).ready(function(){page.handlePage()});
    }
};
