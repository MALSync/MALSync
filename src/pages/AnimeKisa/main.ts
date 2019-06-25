import { pageInterface } from "./../pageInterface";

export const AnimeKisa: pageInterface = {
  name: "AnimeKisa",
  domain: "https://animekisa.tv",
  type: "anime",
  isSyncPage: function(url) {
    if (url.split("/")[3] !== null && j.$("div.c a.infoan2")[0] && j.$("#playerselector option:selected")[0]) {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url){return j.$("div.c a.infoan2").text().trim()},
    getIdentifier: function(url) {
      return j.$("div.c a.infoan2").attr("href");
    },
    getOverviewUrl: function(url){
      return AnimeKisa.domain + "/" + j.$("div.c a.infoan2").attr("href");
    },
    getEpisode: function(url){
      return j.$("#playerselector option:selected").text().replace(/\D+/g, "");}
    },
    overview:{
      getTitle: function(url){
        return j.$("#body > div.notmain > div > div.infobox > div.infoboxc > div.infodesbox > h1").text().trim();
      },
      getIdentifier: function(url){
        return url.split("/")[3];
      },
      uiSelector: function(selector){selector.insertBefore(j.$(".infoepboxmain").first());},
    },
    init(page){
      if(document.title == "Just a moment..."){
        con.log("loading");
        page.cdn();
        return;
      }
      api.storage.addStyle(require('./style.less').toString());
      j.$(document).ready(function(){
        if (page.url.split("/")[3] !== null && j.$("div.c a.infoan2")[0] && j.$("#playerselector option:selected")[0] || page.url.split("/")[3] !== null && j.$("#body > div.notmain > div > div.infobox > div.infoboxc > div.infodesbox > h1")[0] && j.$("#body > div.notmain > div > div.infobox > div.infoepboxmain")[0])
        {
         page.handlePage();
       }
     });
    }
  };
