import {pageInterface} from "./../../pages/pageInterface";

export const hanime: pageInterface = {
  name: "hanime",
  domain: "https://hanime.tv",
  type: "anime",
  isSyncPage: function(url) {
    if(url.split("/")[3] === "videos" && url.split("/")[4] === "hentai") {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url){
      return j.$("h1.tv-title").text().replace(/ ([^a-z]*)$/gmi,"").trim();
    },
    getIdentifier: function(url) {
      return utils.urlPart(url, 5).replace(/-([^a-z]*)$/gmi,"").trim();
    },
    getOverviewUrl: function(url){
      var overviewPart = utils.urlPart(url, 5);
        var temp = overviewPart.match(/-([^a-z]*)$/gmi);
        if(temp !== null){
          return hanime.domain + "/videos/hentai/" + hanime.sync.getIdentifier(url) + "-1";
        } else {
          return hanime.domain + "/videos/hentai/" + hanime.sync.getIdentifier(url);
        }
    },
    getEpisode: function(url){
      var episodePart = utils.urlPart(url, 5);
      if(episodePart.length){
        var temp = episodePart.match(/-([^a-z]*)$/gmi);
        if(temp !== null){
          return temp[0].replace(/\D+/g, "");
        } else {
          return 1;
        }
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
      if (page.url.split("/")[3] === "videos" && page.url.split("/")[4] === "hentai") {
        utils.waitUntilTrue(
          function() {
            return j.$("h1.tv-title").text();
          },
          function() {
            page.handlePage();
          }
          );
      }
    });
    utils.urlChangeDetect(function() {
      page.url = window.location.href;
      page.UILoaded = false;
      $("#flashinfo-div, #flash-div-bottom, #flash-div-top").remove();
      if (page.url.split("/")[3] === "videos" && page.url.split("/")[4] === "hentai") {
        utils.waitUntilTrue(
          function() {
            return j.$("h1.tv-title").text();
          },
          function() {
            page.handlePage();
          }
          );
      }
    });
  }
};
