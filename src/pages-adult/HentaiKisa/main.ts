import {pageInterface} from "./../../pages/pageInterface";

export const HentaiKisa: pageInterface = {
  name: "HentaiKisa",
  domain: "https://hentaikisa.com",
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
      return HentaiKisa.domain + "/" + j.$("div.c a.infoan2").attr("href");
    },
    getEpisode: function(url){
      return j.$("#playerselector option:selected").text().replace(/\D+/g, "");
    },
    nextEpUrl: function(url){
      var num = $("#playerselector").find("option:selected").next().attr('value');
      var href = url.replace(/\d+$/, num);
      if(typeof num !== 'undefined' && href !== url){
        return utils.absoluteLink(href, HentaiKisa.domain);
      }
    },
  },
  overview:{
    getTitle: function(url){
      return j.$("#body > div.notmain > div > div.infobox > div.infoboxc > div.infodesbox > h1").text().trim();
    },
    getIdentifier: function(url){
      return url.split("/")[3];
    },
    uiSelector: function(selector){selector.insertBefore(j.$("#body > div.notmain > div > div.infobox > div.iepbox.nobackground").first());},
  },
  init(page){
    if(document.title == "Just a moment..."){
      con.log("loading");
      page.cdn();
      return;
    }
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function(){
      if (page.url.split("/")[3] !== null && j.$("div.c a.infoan2")[0] && j.$("#playerselector option:selected")[0] || page.url.split("/")[3] !== null && j.$("#body > div.notmain > div > div.infobox > div.infoboxc > div.infodesbox > h1")[0] && j.$("#body > div.notmain > div > div.infobox > div.iepbox.nobackground")[0])
      {
       page.handlePage();
     }
   });
  }
};
