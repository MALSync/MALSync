import { pageInterface } from "./../pageInterface";

export const myAnime: pageInterface = {
  name: "myAnime",
  domain: "https://myanime.moe",
  type: "anime",
  isSyncPage: function(url) {
    if (url.split("/")[5] !== undefined && url.split("/")[5].length > 0) {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url){return j.$("#episode-details > div > span.current-series > a").text()},
    getIdentifier: function(url) {
      return url.split("/")[4];
    },
    getOverviewUrl: function(url){
      return myAnime.domain + j.$("#episode-details > div > span.current-series > a").attr("href")
    },
    getEpisode: function(url){
      return parseInt(utils.urlPart(url, 5));
    },
    nextEpUrl: function(url){return myAnime.domain + j.$('div#ep-next').first().parent().attr('href');
    },
},
overview:{
  getTitle: function(url){
    return j.$("span.anime-title").first().text().trim();
  },
  getIdentifier: function(url){
    return utils.urlPart(url,4);
  },
  uiSelector: function(selector){
    selector.insertAfter(j.$("img.anime-bg").first());
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
    if(page.url.split("/")[3] === "anime") {
      page.handlePage();
    }
  });
}
};
