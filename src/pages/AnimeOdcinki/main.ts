import { pageInterface } from "./../pageInterface";

export const AnimeOdcinki: pageInterface = {
  name: "AnimeOdcinki",
  domain: "https://anime-odcinki.pl",
  type: "anime",
  isSyncPage: function (url) {
    return url.split("/")[5] !== undefined;
  },
  sync: {
    getTitle: function (url) {
      return j.$('.field-name-field-tytul-anime a').text();
    },
    getIdentifier: function (url) {
      return url.split("/")[4];
    },
    getOverviewUrl: function (url) {
      return utils.absoluteLink(j.$('.field-name-field-tytul-anime a').attr("href"), AnimeOdcinki.domain)
    },
    getEpisode: function (url) {
      return parseInt(j.$(".page-header").text().substr(j.$('.field-name-field-tytul-anime a').text().length).match(/\d+/i)[0]);
    },
    nextEpUrl: function (url) {
      return j.$("#video-next").attr("href");
    }
  },
  overview: {
    getTitle: function (url) {
      return j.$(".page-header").text();
    },
    getIdentifier: function (url) {
      return url.split("/")[4];
    },
    uiSelector: function (selector) {
      selector.insertAfter(j.$('#user-anime-top').first());
    },
    list:{
      offsetHandler: false,
      elementsSelector: function(){
        return j.$("div.view-content > ul > li.lista_odc_tytul_pozycja");
      },
      elementUrl: function(selector){
        return selector.find('a').first().attr('href');
      },
      elementEp: function(selector){
        return selector.find('a').first().attr('href').split("/")[5].match(/\d+/gmi);
      }
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
      if(page.url.split("/")[5] !== undefined) {
        page.handlePage();
      } else {
        utils.waitUntilTrue(function(){return j.$('div.view-content').length}, function(){
          page.handlePage();
        });
      }
    });
  }
};
