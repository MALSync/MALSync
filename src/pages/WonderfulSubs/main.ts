import { pageInterface } from "./../pageInterface";

export const WonderfulSubs: pageInterface = {
  name: "WonderfulSubs",
  domain: "https://wonderfulsubs.com",
  type: "anime",
  isSyncPage: function(url) {
    if (url.split("/")[3] === "watch") {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url) {
      return j.$("span.card-title p.hide-truncate.activator").text();
    },
    getIdentifier: function(url) {
      return j.$("span.card-title p.hide-truncate.activator").text().toLowerCase().replace(/ /g,"-");
    },
    getOverviewUrl: function(url) {
      return WonderfulSubs.domain + "/watch/" + url.split("/")[4];
    },
    getEpisode: function(url) {
      return j.$("span.card-title span.new.badge").text().replace(/\D+/g, '');
    }
  },
  init(page) {
    api.storage.addStyle(require("./style.less").toString());
    utils.waitUntilTrue(
      function() {
        return j.$("span.card-title p.hide-truncate.activator").text();
      },
      function() {
        page.handlePage();
      }
    );
    utils.urlChangeDetect(function(){
        page.url = window.location.href;
        page.UILoaded = false;
        $('#flashinfo-div, #flash-div-bottom, #flash-div-top').remove();
        page.handlePage();
      });
  }
};
