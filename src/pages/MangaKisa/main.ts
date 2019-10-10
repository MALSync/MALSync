import { pageInterface } from "./../pageInterface";

export const MangaKisa: pageInterface = {
  name: "MangaKisa",
  domain: "https://mangakisa.com",
  type: "manga",
  isSyncPage: function(url) {
    if (j.$("div.now2 > a.infoan2").length) {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url){
      return j.$("div.now2 > a.infoan2").text().trim();
    },
    getIdentifier: function(url) {
     return j.$("div.now2 > a.infoan2").attr("href").split("/")[1];
   },
   getOverviewUrl: function(url){
    return MangaKisa.domain + j.$("div.now2 > a.infoan2").attr("href");
  },
  getEpisode: function(url){
    var episodePart = j.$("#chaptertext option:selected").text()
    if(episodePart.length){
      var temp = episodePart.match(/chapter +\d+/gmi);
      if(temp !== null){
        return temp[0].replace(/\D+/g, "");
      }
    }
  },
  nextEpUrl: function(url){
    var num = $("#chaptertext").find("option:selected").next().attr('value');
    var href = url.replace(/\d+$/, num);
    if(typeof num !== 'undefined' && href !== url){
      return utils.absoluteLink(href, MangaKisa.domain);
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
  uiSelector: function(selector){selector.insertBefore(j.$(".infoepboxmain").first());},
},
init(page){
  if(document.title == "Just a moment..."){
    con.log("loading");
    page.cdn();
    return;
  }
  api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
  j.$(document).ready(function(){
    if (page.url.split("/")[3] !== undefined && page.url.split("/")[3].length > 0 && (j.$("div.now2 > a.infoan2").length || j.$("div.infoboxc > div.infodesbox > h1.infodes").length)) {
      page.handlePage();
    }
  });
}
};
