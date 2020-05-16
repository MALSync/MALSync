import { pageInterface } from "./../pageInterface";

export const bato: pageInterface = {
  name: "bato",
  domain: "https://bato.to",
  type: "manga",
  isSyncPage: function(url) {
    if (url.split("/")[3] === "chapter") {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url){
      return j.$("h3.nav-title > a").text();
    },
    getIdentifier: function(url) {
     return utils.urlPart(bato.sync.getOverviewUrl(url),4);
   },
   getOverviewUrl: function(url){
    return utils.absoluteLink(j.$("h3.nav-title > a").attr("href"),bato.domain);
  },
  getEpisode: function(url){
    return j.$("div.nav-chap > select > optgroup > option:selected").text().match(/(ch\.|chapter)\D?\d+/i)[0].match(/\d+/);
  },
  nextEpUrl: function(url){
    let href = utils.absoluteLink(j.$('div.nav-next > a').first().attr('href'),bato.domain)
    if(href.split("/")[3] === "chapter") {
      return href;
    }
  },
},
overview:{
  getTitle: function(url){
    return j.$("h3.item-title > a").first().text();
  },
  getIdentifier: function(url){
    return utils.urlPart(url,4);
  },
  uiSelector: function(selector){
    selector.insertAfter(j.$("h3.item-title").first());
  },
  list:{
    offsetHandler: false,
    elementsSelector: function(){
      return j.$("div.chapter-list > div.main > div.item");
    },
    elementUrl: function(selector){
      return utils.absoluteLink(selector.find('a').first().attr('href'),bato.domain);
    },
    elementEp: function(selector){
      let episodeText = selector.find('a > b').text();

      if(!episodeText) return NaN;

      let matches = episodeText.match(/(ch\.|chapter)\D?\d+/i);

      if(!matches || matches.length === 0) return NaN;
      
      return Number(matches[0].match(/\d+/));
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
    if (page.url.split("/")[3] === "chapter" || page.url.split("/")[3] === "series") {
      page.handlePage();
    }
  });
}
};
