import { pageInterface } from "./../pageInterface";

export const fourAnime: pageInterface = {
  name: "fourAnime",
  domain: "https://4anime.to",
  type: "anime",
  isSyncPage: function(url) {
    if (j.$(".singletitletop")[0] && j.$(".episodes")[0] ) {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url) {
      return j
      .$("span.singletitletop a")
      .text()
      .trim();
    },
    getIdentifier: function(url) {
      return url.split("/")[3].replace(/\-episode[^]*$/g, "");
    },
    getOverviewUrl: function(url) {
      return fourAnime.domain + "/anime/" + fourAnime.sync.getIdentifier(url);
    },
    getEpisode: function(url) {
      return j
      .$("ul.episodes a.active")
      .text()
      .replace(/\D+/g, "")
      .replace(/^0+/g, "");
    }
  },
  overview:{
    getTitle: function(url){
      return j .$("p.single-anime-desktop").text().trim();
    },
    getIdentifier: function(url){
      return url.split("/")[4].replace(/\-episode[^]*$/g, "");
    },
    uiSelector: function(selector){
      selector.insertAfter(j.$("p.description-mobile").first());
    },
  },
  init(page) {
    api.storage.addStyle(require("!to-string-loader!css-loader!less-loader!./style.less").toString());
    j.$(document).ready(function() {
      if (j.$(".singletitletop")[0] && j.$(".episodes")[0] || page.url.split("/")[3] == "anime") {
      page.handlePage();
      }
    });
  }
};
