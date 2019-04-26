import {pageInterface} from "./../pageInterface";

export const Proxer: pageInterface = {
    name: 'Proxer',
    domain: 'https://proxer.me',
    database: 'Proxer',
    type: 'anime',
    isSyncPage: function(url){
      if(url.split('/')[3] === 'watch'){
        return true;
      }else{
        return false;
      }
    },
	
    sync:{
      getTitle: function(url){return j.$('.wName').text().trim();},
      getIdentifier: function(url){
		  return url.split('/')[4];
		  },
      getOverviewUrl: function(url){
        return 'https://proxer.me/info/'+Proxer.sync.getIdentifier(url)+'/list';
        },
      getEpisode: function(url){
        return url.split('/')[5];
      },
     nextEpUrl: function(url){return Proxer.domain+$('.no_details a')!.last()!.attr('href')!;},
    },
    init(page){
      api.storage.addStyle(require('./style.less').toString());
      j.$(document).ready(function(){
        page.handlePage();
      });
    }
};
