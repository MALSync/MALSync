import {pageInterface} from "./../../pages/pageInterface";

function cleanTitle(title){
  return title.replace(/(\([^\)]*\)|\[[^\]]*\])/g,'').trim();
}

var inter;

export const Nhentai: pageInterface = {
  name: "Nhentai",
  domain: "https://nhentai.net",
  type: "manga",
  isSyncPage: function(url) {
    if (url.split("/")[5] && url.split("/")[5].length){
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url){
      var scripts = j.$('script').text();
      con.info(scripts);
      try {
        return scripts.split('"pretty":\"')[1].split('\"}')[0];
      }catch(e) {
        return '';
      }
    },
    getIdentifier: function(url) {
      return url.split("/")[4];
    },
    getOverviewUrl: function(url){
      return Nhentai.domain+'/g/'+Nhentai.sync.getIdentifier(url);
    },
    getEpisode: function(url){
      try {
        var scripts = j.$('script').text();
        if(scripts.indexOf('"english":"') !== -1) {
          var episodePart = scripts.split('"english":"')[1].split('"')[0];
        }else {
          var episodePart = scripts.split('"japanese":"')[1].split('"')[0];
        }
        if(episodePart.length){
          var temp = episodePart.match(/(ch|ch.|chapter).?\d+/gmi);
          if(temp !== null){
            return temp[0].replace(/\D+/g, "");
          }
        }
      }catch(e) {
        con.info(e);
      }
      return 1;
    },
  },
  overview:{
    getTitle: function(){return cleanTitle(j.$('meta[itemprop="name"]').first().attr('content'));},
    getIdentifier: function(url){return Nhentai.sync.getIdentifier(url);},
    uiSelector: function(selector){selector.insertAfter(j.$("#info h1").first());},
  },
  init(page){
    if(document.title == "Just a moment..."){
      con.log("loading");
      page.cdn();
      return;
    }
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());

    j.$(document).ready(function(){
      if(page.url.match(/nhentai.[^\/]*\/g\/\d+/i)) {
        page.handlePage();
      }
    });

    return;
    start();

    utils.changeDetect(start, () => {return window.location.href.replace(/\d*$/, '')});

    function start() {
      if(page.url.match(/nhentai.[^\/]*\/g\/\d+/i)) {
        page.handlePage();
      }
    }
  }
};
