import { pageInterface } from "./../pageInterface";

export const MangaKisa: pageInterface = {
  name: "MangaKisa",
  domain: "https://mangakisa.com",
  type: "manga",
  isSyncPage: function(url) {
    if (url.split("/")[3] !== undefined && j.$("div.now2 > a.infoan2").length) {
      return true;
    } else {
      return false;
    }
  },
  isOverviewPage: function(url) {
    return url.split("/")[3] !== undefined && j.$("div.infoboxc > div.infodesbox > h1.infodes").length;
  },
  sync: {
    getTitle: function(url){
      return j.$("div.now2 > a.infoan2").text().trim();
    },
    getIdentifier: function(url) {
      const anchorHref = j.$("div.now2 > a.infoan2").attr("href");

      if(!anchorHref) return "";

     return anchorHref.split("/")[1];
   },
   getOverviewUrl: function(url){
    return MangaKisa.domain + (j.$("div.now2 > a.infoan2").attr("href") || "");
  },
  getEpisode: function(url){
    var episodePart = j.$("#chaptertext option:selected").text();

    if(!episodePart) return NaN;

    var matches = episodePart.match(/chapter +\d+/gmi);

    if(!matches || matches.length === 0) return NaN;

    return Number(matches[0].replace(/\D+/g, ""));
  },
  nextEpUrl: function(url){
    var num = $("#chaptertext").find("option:selected").next().attr('value');

    if(!num) return;

    var href = url.replace(/\d+$/, num);

    if(typeof num !== 'undefined' && href !== url){
      return utils.absoluteLink(href, MangaKisa.domain);
    }
  },
},
overview:{
  getTitle: function(url){
    return j.$("div.notmain > div > div.infobox > div.infoboxc > div.infodesbox > h1").text().trim();
  },
  getIdentifier: function(url){
    return url.split("/")[3];
  },
  uiSelector: function(selector){selector.insertBefore(j.$(".infoepboxmain").first());},
  list:{
    offsetHandler: false,
    elementsSelector: function(){
      return j.$("div.infoepbox > a");
    },
    elementUrl: function(selector){
      return MangaKisa.domain + "/" + selector.find('.infoepmain').first().parent().attr('href');
    },
    elementEp: function(selector){
      return selector.find('div.infoept2r > div, div.infoept2 > div').first().text();
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
    page.handlePage();
  });
}
};
