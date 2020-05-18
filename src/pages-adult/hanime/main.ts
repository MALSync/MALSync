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
      const urlPart5 = utils.urlPart(url, 5);

      if(!urlPart5) return "";

      return urlPart5.replace(/-([^a-z]*)$/gmi,"").trim();
    },
    getOverviewUrl: function(url){
      var overviewPart = utils.urlPart(url, 5);

      if(!overviewPart) return "";

      var temp = overviewPart.match(/-([^a-z]*)$/gmi);
      if(temp !== null){
        return hanime.domain + "/videos/hentai/" + hanime.sync.getIdentifier(url) + "-1";
      } else {
        return hanime.domain + "/videos/hentai/" + hanime.sync.getIdentifier(url);
      }
    },
    getEpisode: function (url) {
      let urlParts = url.split("/");
  
      if (!urlParts || urlParts.length === 0) return NaN;
  
      let episodePart = urlParts[5];
  
      if (episodePart.length === 0) return NaN;
  
      let temp = episodePart.match(/-([^a-z]*)$/gmi);
  
      if (!temp || temp.length === 0) return NaN;
  
      return Number(temp[0].replace(/\D+/g, ""));
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
