import { pageInterface } from "./../pageInterface";

export const animevibe: pageInterface = {
  name: "animevibe",
  domain: "https://animevibe.tv",
  type: "anime",
  isSyncPage: function(url) {
    if (url.split("/")[3] === "a") {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url){return j.$("span.td-bred-no-url-last").text()},
    getIdentifier: function(url) {
      return url.split("/")[4];
    },
    getOverviewUrl: function(url){
      return animevibe.domain+'/a/'+animevibe.sync.getIdentifier(url)+'/1';
    },
    getEpisode: function(url){
      if (utils.urlPart(url, 5) === "") {
        return 1;
      } else {
        return parseInt(utils.urlPart(url, 5));
      }
    }
  },
  init(page){
    api.storage.addStyle(require('./style.less').toString());
    j.$(document).ready(function(){
      page.handlePage();
    });
  }
};
