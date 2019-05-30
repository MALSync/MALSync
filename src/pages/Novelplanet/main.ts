import {pageInterface} from "./../pageInterface";

export const Novelplanet: pageInterface = {
    name: 'Novelplanet',
    domain: 'https://novelplanet.com',
    //database: 'Novelplanet',
    type: 'manga',
    isSyncPage: function(url){
      if(typeof utils.urlPart(url, 5) != 'undefined'){
        return true;
      }
      return false;
    },
    sync:{
      getTitle: function(url){return j.$('#main .title').first().text().trim();},
      getIdentifier: function(url){return utils.urlPart(url, 4);},
      getOverviewUrl: function(url){return url.split('/').slice(0,5).join('/');},
      getEpisode: function(url){
        return getEp($('.selectChapter option').first().text());
      },
      getVolume: function(url){
        try{
          url = url.match(/vol(ume)\D?\d+/i)[0];
          url = url.match(/\d+/)[0];
        }catch(e){
         return;
        }
        return url;
      },
    },
    overview:{
      getTitle: function(){return j.$('.post-contentDetails .title').first().text();},
      getIdentifier: function(url){return Novelplanet.sync.getIdentifier(url)},
      uiSelector: function(selector){selector.insertAfter(j.$(".post-contentDetails p").first());},
      list:{
        offsetHandler: false,
        elementsSelector: function(){return j.$(".rowChapter");},
        elementUrl: function(selector){return utils.absoluteLink(selector.find('a').first().attr('href'), Novelplanet.domain);},
        elementEp: function(selector){
          return getEp(selector.find('a').first().text());
        },
      }
    },
    init(page){
      page.novel = true;
      if(document.title == "Just a moment..."){
          con.log("loading");
          page.cdn();
          return;
      }
      api.storage.addStyle(require('./style.less').toString());
      j.$(document).ready(function(){page.handlePage()});
    }
};

function getEp(episodePart){
  var temp = episodePart.match(/[c,C][h,H][a,A]?[p,P]?[t,T]?[e,E]?[r,R]?\D?\d+/);
  if(temp === null){
    episodePart = episodePart.replace(/[V,v][o,O][l,L]\D?\d+/,'');
    temp = episodePart.match(/\d{3}/);
    if(temp === null){
      temp = episodePart.match(/\d+/);
      if(temp === null){
        episodePart = 0;
      }else{
        episodePart = temp[0];
      }
    }else{
      episodePart = temp[0];
    }
  }else{
    episodePart = temp[0].match(/\d+/)[0];
  }
  return episodePart;
}
