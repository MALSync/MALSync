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
      //uiSelector: function(selector){selector.insertAfter(j.$("#beschreibung > p").first());},
    },
	/*
    overview:{
      getTitle: function(url){return Anime4you.sync.getTitle(url);},
      getIdentifier: function(url){return Anime4you.sync.getIdentifier(url)},
      uiSelector: function(selector){ Anime4you.sync!.uiSelector!(selector)},
      list:{
        elementsSelector: function(){return j.$('.episoden li');},
        elementUrl: function(selector){return utils.absoluteLink(selector.find("a").first().attr('href'), Anime4you.domain);},
        elementEp: function(selector){return Anime4you.sync!.getEpisode(Anime4you.overview!.list!.elementUrl(selector))},
      }
    },
	*/
    init(page){
      api.storage.addStyle(require('./style.less').toString());
      j.$(document).ready(function(){
        page.handlePage();
      });
    }
};
/*
  11  src/pages/Proxer/style.less 
@@ -0,0 +1,11 @@
@import "./../pages";

@textColor: white;

.mal-sync-active a {
    background-color: #72abff !important;
}

#flashinfo-div{
  z-index: 100 !important;
}
  5  src/pages/pageUrls.js 
@@ -100,5 +100,10 @@ module.exports = {
      '*://animeheaven.eu/i.php*',
      '*://animeheaven.eu/watch.php*'
    ]
  },
  Anime4you: {
    match: [
      '*://*.anime4you.one/show/1/aid/*',
    ]
  }
  
}*/
