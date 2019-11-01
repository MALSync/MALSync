import { pageInterface } from "./../pageInterface";

export const AnimesVision: pageInterface = {
  name: "AnimesVision",
  domain: "https://www.animesvision.com.br",
  type: "anime",
  isSyncPage: function(url) {
    if (url.split("/")[3] === "animes") {
      con.log("saaas")
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
      return "Animevibe.domain+'/a/'+Animevibe.sync.getIdentifier(url)+'/1'";
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
    con.log("sees")
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function(){
      page.handlePage();
    });
  }
};
