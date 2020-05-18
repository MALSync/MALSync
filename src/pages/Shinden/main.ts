import { pageInterface } from "./../pageInterface";

export const Shinden: pageInterface = {
  name: "Shinden",
  domain: "https://shinden.pl",
  type: "anime",
  isSyncPage: function(url) {
    if (url.split("/")[3] === "episode") {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url){return j.$(".page-title > a").text().trim()},
    getIdentifier: function(url) {
      return url.split("/")[4];
    },
    getOverviewUrl: function(url){
      return j.$("h1.page-title > a").attr("href") || "";
    },
    getEpisode: function(url){
      const episodeText = j.$("dl.info-aside-list:nth-child(1) > dd:nth-child(2)").text();

      if(!episodeText) return NaN;

      return Number(episodeText.replace(/\D+/g, ""));
    }
  },
  overview:{
    getTitle: function(url){
      return j.$("h1.page-title").text().replace(/anime:/gmi,"").trim();
    },
    getIdentifier: function(url){
      return url.split("/")[4];
    },
    uiSelector: function(selector){selector.insertAfter(j.$(".title-other").first());},
  },
  init(page){
    if(document.title == "Just a moment..."){
      con.log("loading");
      page.cdn();
      return;
    }
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function(){
      if (page.url.split("/")[3] === "series" || page.url.split("/")[3] === "episode") {
        page.handlePage();
      }
    });
  }
};
