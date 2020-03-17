import { pageInterface } from "./../pageInterface";

export const animeultima: pageInterface = {
  name: "animeultima",
  domain: "https://animeultima.to",
  type: "anime",
  isSyncPage: function(url) {
    if (url.split("/")[3] === "a" && j.$("h1.title.is-marginless span.is-size-4.is-size-5-touch.is-size-6-mobile")[0]) {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url){return j.$("h1.title.is-marginless span.is-size-4.is-size-5-touch.is-size-6-mobile").text().replace(/\n.*/g, "").trim();
    },
    getIdentifier: function(url) {
      return url.split("/")[4];
    },
    getOverviewUrl: function(url){
      return animeultima.domain+'/a/'+animeultima.sync.getIdentifier(url);
    },
    getEpisode: function(url){
      return j.$("h1.title.is-marginless span.is-size-4.is-size-5-touch.is-size-6-mobile").text().replace(/.*\n/g, "").replace(/\D+/g, "");
    },
    nextEpUrl: function(url){
      var href = j.$(".level-right a").first().attr('href');
      if(typeof href !== 'undefined'){
        return utils.absoluteLink(href, animeultima.domain);
      }
    },
  },
  overview:{
    getTitle: function(url){
      return utils.getBaseText($('h1.title.is-marginless.is-paddingless').first()).replace(/[^ \w]+/g, "").trim();
    },
    getIdentifier: function(url){
      return url.split("/")[4];
    },
    uiSelector: function(selector){
      selector.insertAfter(j.$("div.tags.is-marginless").first());
    },
  },
  init(page){
    if(document.title == "Just a moment..."){
        con.log("loading");
        page.cdn();
        return;
    }
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function(){page.handlePage()});
  }
};
