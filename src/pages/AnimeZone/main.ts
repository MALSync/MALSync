import { pageInterface } from "./../pageInterface";

export const AnimeZone: pageInterface = {
  name: "AnimeZone",
  domain: "https://www.animezone.pl",
  type: "anime",
  isSyncPage: function (url) {
    return url.split("/")[5] !== undefined;
  },
  sync: {
    getTitle: function (url) {
      return j.$(".category-description .panel-title").attr("title");
    },
    getIdentifier: function (url) {
      return url.split("/")[4];
    },
    getOverviewUrl: function (url) {
      return utils.absoluteLink(j.$(".all-episodes > a").attr("href"), AnimeZone.domain)
    },
    getEpisode: function (url) {
      return url.split("/")[5];
    },
    nextEpUrl: function (url) {
      let href = j.$(".next a").attr("href");
      if (href)
        return utils.absoluteLink(href, AnimeZone.domain);
    }
  },
  overview: {
    getTitle: function (url) {
      return j.$(".category-description .panel-title").attr("title");
    },
    getIdentifier: function (url) {
      return url.split("/")[4];
    },
    uiSelector: function (selector) {
      selector.insertAfter(j.$('.ratings .panel-body .description').first());
    }
  },

  init(page) {
    if (document.title == "Just a moment...") {
      con.log("loading");
      page.cdn();
      return;
    }
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function () {
      page.handlePage();

      var target = j.$("#episode")[0];
      var config = { attributes: false, childList: true, subtree: true };

      var callback = function (mutationsList, observer) {
        for (let mutation of mutationsList) {
          if (mutation.type === 'childList') {

            let srcElement = (j.$("#episode a") || j.$(" #episode iframe"))[0];
            let src = (srcElement.href || srcElement.src).replace(/^http:\/\//i, 'https://');
            j.$("#episode .embed-container")[0].innerHTML = null;


            let iframe = document.createElement("iframe");
            j.$("#episode .embed-container")[0].appendChild(iframe);
            iframe.setAttribute("allowfullscreen", "true");
            iframe.src = src;

            iframe.width = "100%";
            iframe.height = "100%";
            observer.disconnect();

          };
        }
      };

      var observer = new MutationObserver(callback);

      j.$(".btn.btn-xs.btn-success").each(function (i, e) {
        j.$(e).click(function () {
          observer.observe(target, config);
        });
      });
    });
  }
};
