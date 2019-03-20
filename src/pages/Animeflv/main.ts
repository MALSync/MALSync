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
      getTitle: function(url){
        document.body.insertAdjacentHTML( 'afterbegin', '<div id="MALSync" class="MALSync" style="display: none;"><ul id="MALSyncUl" class="MALSyncUl"></ul></div>' );
          var idMALSync = document.getElementById('MALSyncUl');
          var patron = /<script>\s\s   var([^]*?)<\/script>/g;
          var html = document.body.innerHTML;
          var scriptEps = patron.exec(html);
            if(scriptEps != null){
              // @ts-ignore
              scriptEps = scriptEps[1] || null;
              if(scriptEps != null){
                // @ts-ignore
                console.log(scriptEps);
                var patron2 = /\[([^\[\]]{0,10},{0,10})\]/g;
                var eps = scriptEps.toString().match(patron2);
                if(eps != null){
                  // @ts-ignore
                  console.log(eps);
                  eps.forEach(element => {
                    if(idMALSync != null){
                      var Url = animeflv.domain+'/ver/'+element.split(',')[1].replace(']','')+'/'+utils.urlPart(url, 5)+'-'+element.split(',')[0].replace('[','');
                      var Episodio = element.split(',')[0].replace('[','');
                      console.log(element);
                      idMALSync.innerHTML += '<li><a href="'+Url+'" epi="'+Episodio+'"></a> </li>';
                    }
                  });
                }
              }
            }
        return j.$('h2.Title').text();}, //Funciona
      getIdentifier: function(url){return utils.urlPart(url, 4)+'/'+utils.urlPart(url, 5);}, //Funciona
      uiSelector: function(selector){selector.insertAfter(j.$(".Description"));}, //Funciona
      list:{ //Bug no carga todos los episodios, si hay muchos
        offsetHandler: false,
        elementsSelector: function(){return j.$(".MALSync a");}, //Funciona
        elementUrl: function(selector){return utils.absoluteLink(selector.attr('href'), animeflv.domain);}, //Funciona
        elementEp: function(selector){return selector.attr('epi')}, //Funciona
      }
    },
    init(page){
      api.storage.addStyle(require('./style.less').toString());
      j.$(document).ready(function(){page.handlePage()});
    }
};
