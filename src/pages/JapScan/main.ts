import { pageInterface } from "./../pageInterface";

export const JapScan: pageInterface = {
  name: "JapScan",
  domain: "https://www.japscan.co",
  type: "manga",
  isSyncPage: function(url) {
    if (url.split("/")[3] === "lecture-en-ligne") {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url){
      return utils.getBaseText($("ol.breadcrumb > li:nth-child(3) > a").first()).trim();
    },
    getIdentifier: function(url) {
     return url.split("/")[4];
   },
   getOverviewUrl: function(url){
    return JapScan.domain + j.$("ol.breadcrumb > li:nth-child(3) > a").first().attr("href");
  },
  getEpisode: function(url){
    return url.split("/")[5];
  },
  nextEpUrl: function(url){
    if (j.$("div.clearfix > p > span").last().text() == "Chapitre Suivant" && j.$("div.clearfix > p > a").last().attr("href").length) {
      return JapScan.domain + j.$("div.clearfix > p > a").last().attr("href")
    }
  },
},
overview:{
  getTitle: function(url){
    return j.$("div#main > div.card > div.card-body > h1").first().text().replace(/^[a-z]+/gmi,"").trim();
  },
  getIdentifier: function(url){
    return utils.urlPart(url,4);
  },
  uiSelector: function(selector){
    selector.insertAfter(j.$("div#main > div.card > div.card-body > h1").first());
  },
  list:{
    offsetHandler: false,
    elementsSelector: function(){
      return j.$("div#chapters_list > div > div.chapters_list.text-truncate");
    },
    elementUrl: function(selector){
      return utils.absoluteLink(selector.find('a').first().attr('href'),JapScan.domain);
    },
    elementEp: function(selector){
      return selector.find('a').first().attr('href').split("/")[3].match(/\d+/gmi);
    }
  }
},
init(page){
  if(document.title == "Just a moment..."){
    con.log("loading");
    page.cdn();
    return;
  }
  api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
  j.$(document).ready(function(){
    if (page.url.split("/")[3] === "manga" || (page.url.split("/")[3] === "lecture-en-ligne" && j.$("div#image").length)) {
      page.handlePage();
    }
  });
}
};
