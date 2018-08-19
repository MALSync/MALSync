import {pageInterface} from "./../pageInterface";

export const Kissanime: pageInterface = {
    domain: 'http://kissanime.ru',
    type: 'anime',
    isSyncPage: function(){return true;},
    sync:{
      getTitle: function(){return $('.bigChar').first().text();},
      getIdentifier: function(){return $('.bigChar').first().text();},
      getEpisode: function(){return $('.bigChar').first().text();},
    }
};
