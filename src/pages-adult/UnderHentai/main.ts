import {pageInterface} from "./../../pages/pageInterface";

export const UnderHentai: pageInterface = {
  name: "UnderHentai",
  domain: "https://www.underhentai.net",
  type: "anime",
  isSyncPage: function(url) {
    if (url.split("/")[3] === "watch") {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url){return j.$("div.content-box.content-head.sidebar-light").first().text().trim().replace(/- episode.*\d+/gmi,"").trim()},
    getIdentifier: function(url) {
      return UnderHentai.sync.getTitle(url).toLowerCase().replace(/[^A-Z0-9 ]/gmi,"").replace(/\s+/gm, "-").trim().replace(" ", "-");
    },
    getOverviewUrl: function(url){
      return UnderHentai.domain+ "/" +UnderHentai.sync.getIdentifier(url);
    },
    getEpisode: function(url){
      var episodePart = j.$("div.content-box.content-head.sidebar-light").first().text().trim()
      if(episodePart.length){
        var temp = episodePart.match(/- episode.*\d+/gmi);
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
      return j.$("h1.content-box.content-head.sidebar-light").first().text().trim();
    },
    getIdentifier: function(url){
      return url.split("/")[3];
    },
    uiSelector: function(selector){selector.insertBefore(j.$("div.content-table").first());},
  },
  init(page){
    if(document.title == "Just a moment..."){
      con.log("loading");
      page.cdn();
      return;
    }
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function(){
      if (page.url.split("/")[3] === "watch" || (page.url.split("/")[3] !== null && j.$("div.content-table > table > thead > tr > th.c1").text() === "Episode")) {
        page.handlePage();
      }
    });
  }
};
