import {pageInterface} from "./../../pages/pageInterface";

export const Hentaigasm: pageInterface = {
  name: "Hentaigasm",
  domain: "http://hentaigasm.com",
  type: "anime",
  isSyncPage: function(url) {
    if (url.split("/")[6] !== null && j.$("#extras > h4:nth-child(2) > a")[0] && j.$("div.entry-content.rich-content")[0]) {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url){return j.$("h1#title").text().replace(/\d+ (subbed|raw)/gmi,"").trim()},
    getIdentifier: function(url) {
      return url.split("/")[6].replace(/-\d*-(subbed|raw)/gmi,"").trim();
    },
    getOverviewUrl: function(url){
      return j.$("#extras > h4:nth-child(2) > a").attr("href");
    },
    getEpisode: function(url){
      var episodePart = url.split("/")[6];
      if(episodePart.length){
        var temp = episodePart.match(/-\d+-(subbed|raw)/gmi);
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
      return j.$("#content > div.loop-header > h1 > em").text()
    },
    getIdentifier: function(url){
      return url.split("/")[4];
    },
    uiSelector: function(selector){
      selector.insertAfter(j.$("div.loop-actions").first());
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
      if ((page.url.split("/")[6] !== null && j.$("#extras > h4:nth-child(2) > a")[0] && j.$("div.entry-content.rich-content")[0]) || page.url.split("/")[3] === "category")
      page.handlePage();
    });
  }
};
