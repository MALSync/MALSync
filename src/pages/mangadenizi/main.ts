import { pageInterface } from "./../pageInterface";

export const mangadenizi: pageInterface = {
  name: "mangadenizi (Bad)",
  domain: "https://mangadenizi.com",
  type: "manga",
  isSyncPage: function(url) {
    if (url.split("/")[5] !== undefined && url.split("/")[5].length > 0) {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url){return j.$("#navbar-collapse-1 > ul > li:nth-child(1) > a").text()},
    getIdentifier: function(url) {
     return utils.urlPart(url,4);
   },
   getOverviewUrl: function(url){
    return j.$("#navbar-collapse-1 > ul > li:nth-child(1) > a").attr("href");
  },
  getEpisode: function(url){
    return url.split("/")[5];
  }
},
overview:{
  getTitle: function(url){
    return j.$("h2.widget-title").first().text();
  },
  getIdentifier: function(url){
    return utils.urlPart(url,4);
  },
  uiSelector: function(selector){
    selector.insertAfter(j.$("h2.widget-title").first());
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
    if (page.url.split("/")[3] === "manga") {
      page.handlePage();
    }
  });
}
};
