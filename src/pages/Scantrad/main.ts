import {pageInterface} from "./../pageInterface";

export const Scantrad: pageInterface = {
    name: 'Scantrad',
    domain: 'https://scantrad.net/',
    database: 'Scantrad',
    type: 'manga',
    isSyncPage: function(url){
      return url.split('/')[3] === 'mangas';
    },
    sync:{
      getTitle: function(url){return j.$('.tl-titre').text().trim()},
      getIdentifier: function(url){return utils.urlPart(Scantrad.sync.getOverviewUrl(url), 3);},
      getOverviewUrl: function(url){return utils.absoluteLink(j.$('.tl-titre').first().attr('href'), Scantrad.domain);},
      getEpisode: function(url){return parseInt(utils.urlPart(url, 5));},
    },
    overview:{
      getTitle: function(url){return j.$('.titre').text().trim()},
      getIdentifier: function(url){return Scantrad.sync.getIdentifier(url)},
      uiSelector: function(selector){selector.appendTo(j.$(".info"))},
    },
    init(page){
      api.storage.addStyle(require('./style.less').toString());
      j.$(document).ready(function(){
        page.handlePage();
      });
    }
};
