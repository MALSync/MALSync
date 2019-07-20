import { pageInterface } from "./../pageInterface";

export const AnimeIndo: pageInterface = {
  name: "AnimeIndo",
  domain: "http://animeindo.moe",
  type: "anime",
  isSyncPage: function(url) {
    if (url.split("/")[1] !== null && j.$("#sct_content > div > div.preview")[0]) {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url){return j.$("#sct_content > div > div.infobox > h3").text()},
    getIdentifier: function(url) {
      return j.$("#sct_content > div > div.ep_nav.fr > span.nav.all > a").attr("href").split("/")[4];
    },
    getOverviewUrl: function(url){
      return j.$("#sct_content > div > div.ep_nav.fr > span.nav.all > a").attr("href");
    },
    getEpisode: function(url){
      var episodePart = url.split("/")[3];
      if(episodePart.length){
        var temp = episodePart.match(/-episode-\d*/g);
        if(temp !== null){
          return temp[0].replace(/\D+/g, "");
        }
      }
    },
  },
  overview:{
    getTitle: function(url){
      return j.$("#sct_content > div.nodeinfo > h2").first().text().replace(/sinopsis/gi,"").trim();
    },
    getIdentifier: function(url){
      return url.split("/")[4];
    },
    uiSelector: function(selector){
      selector.insertAfter(j.$("#sct_content > h1").first());
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
      if(page.url.split("/")[3] === "anime" || page.url.split("/")[3] !== null && j.$("#sct_content > div > div.preview")[0]) {
        page.handlePage();
      }
  });
  }
};
