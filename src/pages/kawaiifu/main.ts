import { pageInterface } from "./../pageInterface";

export const kawaiifu: pageInterface = {
  name: "kawaiifu",
  domain: "https://kawaiifu.com",
  type: "anime",
  isSyncPage: function(url) {
    if (
      url.split("/")[3] === "season" ||
      url.split("/")[3] === "dub" ||
      url.split("/")[3] === "tv-series"
    ) {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url) {
      return j
        .$("h2.title")
        .text()
        .replace(
          /(?:^|\W)+[uU][nN][cC][eE][nN][sS][oO][rR][eE][dD]+(?:$|\W)/g," ")
        .replace(/(?:^|\W)+[dD][uU][bB]+(?:$|\W)/g, " ")
        .trim();
    },
    getIdentifier: function(url) {
      if (url.split("/")[3] === "dub" || url.split("/")[3] === "tv-series") {
        return url.split("/")[4].replace(/\.[^.]*$/g, "");
      } else {
        return url.split("/")[5].replace(/\.[^.]*$/g, "");
      }
    },
    getOverviewUrl: function(url) {
      if (url.split("/")[3] === "dub" || url.split("/")[3] === "tv-series") {
        return (
          "https://kawaiifu.com/" +url.split("/")[3] + "/" + url.split("/")[4].replace(/\?[^?]*$/g, "")
        );
      } else {
        return (
          "https://kawaiifu.com/" + url.split("/")[3] + "/" + url.split("/")[4] + "/" + url.split("/")[5].replace(/\?[^?]*$/g, "")
        );
      }
    },
    getEpisode: function(url) {
      {
        if (
          j.$("ul.list-ep a.active").text().toLowerCase().indexOf("trailer") !== -1
        ) {
          return 0;
        } else {
          return j.$("ul.list-ep a.active").text().replace(/\D+/g, "");
        }
      }
    }
  },
  init(page) {
    api.storage.addStyle(require("./style.less").toString());
    j.$(document).ready(function() {
      page.handlePage();
    });
  }
};
