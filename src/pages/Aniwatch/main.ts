import { pageInterface } from "./../pageInterface";

var tabPage;

export const Aniwatch: pageInterface = {
  name: "Aniwatch",
  domain: "https://aniwatch.me",
  type: "anime",
  isSyncPage: function(url) {
    if (tabPage === "stream") {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url){return j.$("h1.md-headline.no-margin > span.border-right.pr-5").text()},
    getIdentifier: function(url) {
      return url.split("/")[4];
    },
    getOverviewUrl: function(url){
      return Aniwatch.domain +"/anime/" + Aniwatch.sync.getIdentifier(url);
    },
    getEpisode: function(url){
      return parseInt(utils.urlPart(url, 5));
    }
  },
  overview:{
    getTitle: function(url){
      return j.$("md-content > div > div.responsive-anime.anime-boxes-margin > h1").text();
    },
    getIdentifier: function(url){
      return utils.urlPart(url, 4);
    },
    uiSelector: function(selector){
      selector.insertBefore(j.$("#enable-ani-cm > div > section.section-padding > div > md-content > div > div > md-content > div").first());
    },
  },
  init(page){
    if(document.title == "Just a moment..."){
      con.log("loading");
      page.cdn();
      return;
    }
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());

    utils.changeDetect(() => {
      tabPage = j.$(".md-tab.md-active").text().toLowerCase();
      if(page.url.split("/")[3] === "anime" && typeof tabPage !== "undefined" && (tabPage === "stream" || tabPage === "overview")) {
        utils.waitUntilTrue(
          function() {
            if (j.$("md-content > div > div.responsive-anime.anime-boxes-margin > h1").text() || j.$("h1.md-headline.no-margin > span.border-right.pr-5").text()){
              return true;
            } else {
              return false;
            }
          },
          function() {
            console.log("pagehandle")
            page.handlePage();
          }
          );
      }
    }, () => {
      return window.location.href +"/"+ j.$(".md-tab.md-active").text();
    })
  }
};
