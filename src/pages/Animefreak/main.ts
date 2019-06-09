import { pageInterface } from "./../pageInterface";

export const Animefreak: pageInterface = {
  name: "Animefreak",
  domain: "https://www.animefreak.tv",
  type: "anime",
  isSyncPage: function(url) {
    if (url.split("/")[5] === "episode") {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url){return j.$("div.top-breadcrumb li:nth-child(2) a").text()},
    getIdentifier: function(url) {
      return url.split("/")[4];
    },
    getOverviewUrl: function(url){
      return Animefreak.domain+'/watch/'+Animefreak.sync.getIdentifier(url);
    },
    getEpisode: function(url){
      return url.split("/")[6].replace(/\D+/g, "");;
    }
  },
  overview:{
    getTitle: function(url){
      return j.$("div.top-breadcrumb li:nth-child(2) a").text();
    },
    getIdentifier: function(url){
      return url.split("/")[4];
    },
    uiSelector: function(selector){
      selector.insertBefore(j.$("div.anime-title").first());
    },
  },
  init(page) {
    api.storage.addStyle(require("./style.less").toString());
    j.$(document).ready(function() {
      page.handlePage();
    });
  }
};
