import { pageInterface } from "./../pageInterface";

export const mangalivre: pageInterface = {
  name: "mangalivre (Bad)",
  domain: "https://mangalivre.com",
  type: "manga",
  isSyncPage: function(url) {
    if (url.split("/")[6] !== undefined && url.split("/")[6].length > 0) {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url){
      return j.$("div.series-title > span.title").text();
    },
    getIdentifier: function(url) {
     return utils.urlPart(url,4);
   },
   getOverviewUrl: function(url){
    return mangalivre.domain + j.$("div.series-info-popup-container > div > div > div.series-cover > a").attr("href");
  },
  getEpisode: function(url){
    return url.split("/")[6].replace(/\D+/g, "");
  }
},
overview:{
  getTitle: function(url){
    return j.$("#series-data > div.series-info.touchcarousel > span.series-title > h1").first().text().trim();
  },
  getIdentifier: function(url){
    return utils.urlPart(url,4);
  },
  uiSelector: function(selector){
    selector.insertAfter(j.$("#series-data > div.series-info.touchcarousel > span.series-desc").first());
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
