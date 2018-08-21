import {pageInterface} from "./../pageInterface";

export const Kissmanga: pageInterface = {
    domain: 'http://kissmanga.com',
    type: 'manga',
    isSyncPage: function(url){return true;},
    sync:{
      getTitle: function(url){return $('.bigChar').first().text();},
      getIdentifier: function(url){return $('.bigChar').first().text();},
      getEpisode: function(url){return parseInt($('.bigChar').first().text());},
      getVolume: function(url){return parseInt($('.bigChar').first().text());},
    }
};
