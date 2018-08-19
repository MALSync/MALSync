import {pageInterface} from "./../pageInterface";

export const Kissmanga: pageInterface = {
    domain: 'http://kissmanga.com',
    type: 'manga',
    isSyncPage: function(){return true;},
    sync:{
      getTitle: function(){return $('.bigChar').first().text();},
      getIdentifier: function(){return $('.bigChar').first().text();},
      getEpisode: function(){return $('.bigChar').first().text();},
    }
};
