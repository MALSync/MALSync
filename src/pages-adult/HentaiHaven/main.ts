import {pageInterface} from "./../../pages/pageInterface";

export const HentaiHaven: pageInterface = {
  name: "HentaiHaven",
  domain: "https://hentaihaven.org",
  type: "anime",
  isSyncPage: function(url) {
    if (url.split("/")[3] !== null && j.$("h1.entry-title")[0] && j.$("div.hentaiha-post-tabs")[0]) {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url){return j.$("div > header > div > a").text()},
    getIdentifier: function(url) {
      return j.$("div > header > div > a").attr("href").split("/")[4];
    },
    getOverviewUrl: function(url){
      return j.$("div > header > div > a").attr("href");
    },
    getEpisode: function(url){
      var episodePart = url.split("/")[3];
      if(episodePart.length){
        var temp = episodePart.match(/-episode-\d+/gmi);
        if(temp !== null){
          return temp[0].replace(/\D+/g, "");
        } else {
          return 1;
        }
      }
    },
  },
  overview:{
    getTitle: function(url){
      return j.$("h1.archive-title").text()
    },
    getIdentifier: function(url){
      return url.split("/")[4];
    },
    uiSelector: function(selector){
      selector.insertAfter(j.$("div.archive-meta.category-meta").first());
    },
  },
  init(page){
    if(document.title == "Just a moment..."){
      con.log("loading");
      page.cdn();
      return;
    }
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function(){
      if((page.url.split("/")[3] !== null && j.$("h1.entry-title")[0] && j.$("div.hentaiha-post-tabs")[0]) || (page.url.split("/")[3] === "series"))
      {
        page.handlePage();
      }
    });
  }
};
