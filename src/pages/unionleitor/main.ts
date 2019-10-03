import { pageInterface } from "./../pageInterface";

export const unionleitor: pageInterface = {
  name: "unionleitor",
  domain: "https://unionleitor.top",
  type: "manga",
  isSyncPage: function(url) {
    if (url.split("/")[3] === "leitor" && url.split("/")[5] !== undefined && url.split("/")[5].length > 0) {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url){
      return utils.getBaseText($("body > div.breadcrumbs > div > div > a:nth-child(3)")).trim();
    },
    getIdentifier: function(url) {
     return j.$("body > div.breadcrumbs > div > div > a:nth-child(3)").attr("href").split("/")[4].toLowerCase();
   },
   getOverviewUrl: function(url){
    return j.$("body > div.breadcrumbs > div > div > a:nth-child(3)").attr("href");
  },
  getEpisode: function(url){
    return url.split("/")[5];
  }
},
overview:{
  getTitle: function(url){
    return j.$("div.row > div.col-md-12 > h2").first().text().trim();
  },
  getIdentifier: function(url){
    return utils.urlPart(url,4).toLowerCase();
  },
  uiSelector: function(selector){
    selector.insertAfter(j.$("div.row > div.col-md-12 > h2").first());
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
    if (page.url.split("/")[3] === "leitor" || page.url.split("/")[3] === "manga") {
      page.handlePage();
    }
  });
}
};
