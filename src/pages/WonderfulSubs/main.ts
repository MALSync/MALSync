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
      return j
        .$("span.card-title p.hide-truncate.activator")
        .text()
        .toLowerCase()
        .replace(/ /g, "-");
    },
    getOverviewUrl: function(url) {
      return (
        WonderfulSubs.domain +
        "/watch/" +
        url.split("/")[4].replace(/\?[^?]*$/g, "")
      );
    },
    getEpisode: function(url) {
      return j
        .$("span.card-title span.new.badge")
        .text()
        .replace(/\D+/g, "");
    }
  },
  init(page) {
    api.storage.addStyle(require("!to-string-loader!css-loader!less-loader!./style.less").toString());
    page.url = window.location.href;
    if (page.url.split("/")[2] === "beta.wonderfulsubs.com") {
      WonderfulSubs.isSyncPage = betaWonderfulSubs.isSyncPage;
      WonderfulSubs.sync = betaWonderfulSubs.sync
      betaWonderfulSubs.init(page);
    } else {
      if (page.url.split("/")[3] === "watch") {
        utils.waitUntilTrue(
          function() {
            return j.$("span.card-title p.hide-truncate.activator").text();
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
        if (page.url.split("/")[3] === "watch") {
          utils.waitUntilTrue(
            function() {
              return j.$("span.card-title p.hide-truncate.activator").text();
            },
            function() {
              page.handlePage();
            }
          );
        }
      });
    }
  }
};

var betaWonderfulSubs: pageInterface = {
  name: "betaWonderfulSubs",
  domain: "https://beta.wonderfulsubs.com",
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
      return j.$("h6.subtitle").text();
    },
    getIdentifier: function(url) {
      return j
        .$("h6.subtitle")
        .text()
        .toLowerCase()
        .replace(/ /g, "-");
    },
    getOverviewUrl: function(url) {
      return (
        "https://beta.wonderfulsubs.com" +
        "/watch/" +
        url.split("/")[4].replace(/\?[^?]*$/g, "")
      );
    },
    getEpisode: function(url) {
      return j
        .$("div.episode-number")
        .text()
        .replace(/\D+/g, "");
    }
  },
  init(page) {
    api.storage.addStyle(require("!to-string-loader!css-loader!less-loader!./style.less").toString());
    page.url = window.location.href;
    if (page.url.split("/")[3] === "watch") {
      utils.waitUntilTrue(
        function() {
          return j.$("h6.subtitle").text();
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
      if (page.url.split("/")[3] === "watch") {
        utils.waitUntilTrue(
          function() {
            return j.$("h6.subtitle").text();
          },
          function() {
            page.handlePage();
          }
        );
      }
    });
  }
};
