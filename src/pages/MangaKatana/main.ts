import { pageInterface } from "./../pageInterface";

var obfusList:boolean = false;

export const MangaKatana: pageInterface = {
  name: "MangaKatana",
  domain: "http://mangakatana.com",
  type: "manga",
  isSyncPage: function(url) {
    if (url.split("/")[5] !== undefined && url.split("/")[5].length > 0) {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url){
      return utils.getBaseText($("#breadcrumb_wrap > ol > li:nth-child(2) > a > span")).trim();
    },
    getIdentifier: function(url) {
     return utils.urlPart(url,4);
   },
   getOverviewUrl: function(url){
    return j.$("#breadcrumb_wrap > ol > li:nth-child(2) > a").attr("href") || "";
  },
  getEpisode: function (url) {
    let urlParts = url.split("/");

    if (!urlParts || urlParts.length === 0) return NaN;

    let episodePart = urlParts[5];

    if (episodePart.length === 0) return NaN;

    let temp = episodePart.match(/c\d*/gi);

    if (!temp || temp.length === 0) return NaN;

    return Number(temp[0].replace(/\D+/g, ""));
  },
  nextEpUrl: function(url){
    if(j.$('a.nav_button.next').first().attr('href') !== "javascript:;") {
      return j.$('a.nav_button.next').first().attr('href');
    }
  },
},
overview:{
  getTitle: function(url){
    return j.$("div.info > h1.heading").first().text().trim();
  },
  getIdentifier: function(url){
    return utils.urlPart(url,4);
  },
  uiSelector: function(selector){
    selector.insertBefore(j.$("#single_book").first());
  },
  list:{
    offsetHandler: false,
    elementsSelector: function(){
      if(typeof j.$("div.chapters:not('.uk-hidden') > table > tbody > tr") !== "undefined" && j.$("div.chapters:not('.uk-hidden') > table > tbody > tr").length) {
        return j.$("div.chapters:not('.uk-hidden') > table > tbody > tr");
      } else if(typeof window.location.href.split("/")[5] == "undefined" && typeof j.$("#single_book > script").prev().children().children() !== undefined && j.$("#single_book > script").prev().children().children().length) {
        obfusList = true;
        return j.$("#single_book > script").prev().children().children();
      } else {
        return j.$('.nowaythisexists');
      }
    },
    elementUrl: function(selector){
      if(!obfusList) {
        return utils.absoluteLink(selector.find('td > div.chapter > a').first().attr('href'),MangaKatana.domain)
      } else {
        return utils.absoluteLink(selector.find("div > div > a").first().attr('href'),MangaKatana.domain)
      }
    },
    elementEp: function(selector){
      if(!obfusList) {
        return MangaKatana.sync.getEpisode(selector.find('td > div.chapter > a').first().attr('href'));
      } else {
        return MangaKatana.sync.getEpisode(selector.find('div > div > a').first().attr('href'));
      }
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
    if (page.url.split("/")[3] === "manga" && page.url.split("/")[4] !== undefined && page.url.split("/")[4].length > 0) {
      page.handlePage();
    }
  });
}
};
