import { pageInterface } from "./../pageInterface";

export const AnimeFire: pageInterface = {
  name: "AnimeFire",
  domain: "https://animefire.net",
  type: "anime",
  isSyncPage: function(url) {
    if (url.split("/")[3] === "animes") {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url){
      return AnimeFire.sync.getIdentifier(url).replace(/-/g, " ");
    },
    getIdentifier: function(url) {
      return url.split("/")[4];
    },
    getOverviewUrl: function(url){
      let oUrl = j.$("li.page-item:nth-child(3) > a.page-link").attr("href");
      if(oUrl && oUrl.indexOf("animes") !== -1) {
        return oUrl;
      } else {
        return j.$("li.page-item:nth-child(4) > a.page-link").attr("href") || "";
      }
    },
    getEpisode: function(url){
      return Number(utils.urlPart(url,5));
    },
    nextEpUrl: function(url){
      if(j.$('li.page-item:nth-child(5) > a.page-link > span.prox').length){
        return buildNext(url,j.$('li.page-item:nth-child(5) > a.page-link').attr("href"));
      } else if(j.$('li.page-item:nth-child(4) > a.page-link > span.prox').length) {
        return buildNext(url,j.$('li.page-item:nth-child(4) > a.page-link').attr("href"));
      }
    },
  },
  init(page){
    if(document.title == "Just a moment..."){
      con.log("loading");
      page.cdn();
      return;
    }
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function(){
      if(page.url.split("/")[3] === "animes" && typeof page.url.split("/")[5] !== "undefined") {
        page.handlePage();
      }
    });
  }
};

function buildNext(url,episode) {
  return AnimeFire.domain + "/animes/" + url.split("/")[4] + "/" + episode;
}
