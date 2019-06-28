import { pageInterface } from "./../pageInterface";

export const Meowstream: pageInterface = {
  name: "Meowstream",
  domain: "https://meowstream.com",
  type: "anime",
  isSyncPage: function(url) {
    if (j.$("div.video-content")[0] && j.$("h1.entry-title.title-font")[0]) {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url){return j.$("header h1.entry-title.title-font").text().replace(/\d.*sub.*indo.*/gmi,"").trim()},
    getIdentifier: function(url) {
      return url.split("/")[3].replace(/-\d*-sub-indo.*/gmi,"").trim();
    },
    getOverviewUrl: function(url){
      //returns https://meowstream.com/nonton/Identifier which then will be changed from the website to https://meowstream.com/nonton/Indentifier-sub-indo/
      return Meowstream.domain +  "/nonton/" + Meowstream.sync.getIdentifier(url);
    },
    getEpisode: function(url){
      var episodePart = url.split("/")[3];
      if(episodePart.length){
        var temp = episodePart.match(/-\d*-sub-indo.*/gmi);
        if(temp !== null){
          return temp[0].replace(/\D+/g, "");
        }
      }
    },
  },
  overview:{
    getTitle: function(url){
      return utils.getBaseText($('#data2 > div:nth-child(2)')).trim().replace(/:[ ]*/g,"");
    },
    getIdentifier: function(url){
      return url.split("/")[4].replace(/-sub-indo.*/gmi,"").trim();
    },
    uiSelector: function(selector){
      selector.insertAfter(j.$("div.entry-meta").first());
    },
  },
  init(page){
    if(document.title == "Just a moment..."){
      con.log("loading");
      page.cdn();
      return;
    }
    api.storage.addStyle(require('./style.less').toString());
    j.$(document).ready(function(){
      if (page.url.split("/")[3] == "nonton" || j.$("div.video-content")[0] && j.$("h1.entry-title.title-font")[0] && j.$("#plv > div.contentsembed > div.episode-nav > div > div.eps-nav.pilih")[0]) {
        page.handlePage();
      }
    });
  }
};
