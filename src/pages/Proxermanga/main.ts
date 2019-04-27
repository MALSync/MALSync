import {pageInterface} from "./../pageInterface";

export const Proxermanga: pageInterface = {
    name: 'Proxermanga',
    domain: 'https://proxer.me',
    database: 'Proxermanga',
    type: 'anime',
    isSyncPage: function(url){
      if(url.split('/')[3] === 'read'){
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
        return 'https://proxer.me/info/'+Proxermanga.sync.getIdentifier(url)+'/list';
        },
      getEpisode: function(url){
        return url.split('/')[5];
      },
     nextEpUrl: function(url){return Proxermanga.domain+$('.no_details a')!.last()!.attr('href')!;},
    },
    init(page){
      api.storage.addStyle(require('./style.less').toString());
      j.$(document).ready(function(){
        page.handlePage();
      });
    }
};