import { pageInterface } from "./../pageInterface";

export const AnimeFever: pageInterface = {
  name: "AnimeFever",
  domain: "https://www.animefever.tv",
  type: "anime",
  isSyncPage: function(url) {
    if (url.split("/")[5] === "episode") {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url){return j.$("#player-main > h1 > a").text()},
    getIdentifier: function(url) {
      return url.split("/")[4];
    },
    getOverviewUrl: function(url){
      return AnimeFever.domain + j.$("#player-main > h1 > a").attr("href");
    },
    getEpisode: function(url){
      var episodePart = url.split("/")[6];
      if(episodePart.length){
        var temp = episodePart.match(/episode-\d*/gmi);
        if(temp !== null){
          return temp[0].replace(/\D+/g, "");
        }
      }
    },
  },
  overview:{
    getTitle: function(url){
      return utils.getBaseText($("h1.anime-name > div").first()).trim();
    },
    getIdentifier: function(url){
      return utils.urlPart(url,4);
    },
    uiSelector: function(selector){
      j.$('<div class="px-8"> <p id="malp">'+selector.html()+'</p></div>').insertBefore(j.$("div#overview").first());
    },
  },
  init(page){
    if(document.title == "Just a moment..."){
      con.log("loading");
      page.cdn();
      return;
    }
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    if (page.url.split("/")[3] === "anime" && page.url.split("/")[4] !== undefined && page.url.split("/")[4].length > 0) {
      utils.waitUntilTrue(
        function() {
          if (j.$("#player-main > h1 > a").text() || j.$("h1.anime-name").text()){
            return true;
          } else {
            return false;
          }
        },
        function() {
          page.handlePage();
        }
        );
    }
    utils.urlChangeDetect(function() {
      page.url = window.location.href;
      page.UILoaded = false;
      $("#flashinfo-div, #flash-div-bottom, #flash-div-top").remove();
      if (page.url.split("/")[3] === "anime" && page.url.split("/")[4] !== undefined && page.url.split("/")[4].length > 0) {
        utils.waitUntilTrue(
          function() {
            if (j.$("#player-main > h1 > a").text() || j.$("h1.anime-name").text()){
              return true;
            } else {
              return false;
            }
          },
          function() {
            page.handlePage();
          }
          );
      }
    });
  }
};
