import { pageInterface } from "./../pageInterface";

export const Animeflix: pageInterface = {
  name: "Animeflix",
  domain: "https://animeflix.io",
  type: "anime",
  isSyncPage: function(url) {
    if (url.split("/")[5] !== undefined && url.split("/")[5].length > 0) {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url){
      return utils.getBaseText($("h4.title.text-truncate, h4.headline.text-truncate").first()).replace("()", "").trim();
    },
    getIdentifier: function(url) {
      return utils.urlPart(url,4);
    },
    getOverviewUrl: function(url){
      return Animeflix.domain+'/shows/'+Animeflix.sync.getIdentifier(url);
    },
    getEpisode: function (url) {
      let urlParts = url.split("/");

      if (!urlParts || urlParts.length === 0) return NaN;

      let episodePart = urlParts[5];

      if (episodePart.length === 0) return NaN;

      let temp = episodePart.match(/episode-\d*-/gi);

      if (!temp || temp.length === 0) return NaN;

      return Number(temp[0].replace(/\D+/g, ""));
    },
  },
  overview:{
    getTitle: function(url){
      return j.$("div.flex.xs12.lg8 > h1").text().trim();
    },
    getIdentifier: function(url){
      return utils.urlPart(url,4);
    },
    uiSelector: function(selector){
      j.$('<div class="container"> <p id="malp">'+selector.html()+'</p></div>').insertAfter(j.$("div.my-3").first());
    },
  },
  init(page){
    if(document.title == "Just a moment..."){
      con.log("loading");
      page.cdn();
      return;
    }
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());

    function check() {
      if (page.url.split("/")[3] === "shows") {
        utils.waitUntilTrue(
          function() {
            if (j.$("h4.title.text-truncate").text() || j.$("h4.headline.text-truncate").text() || j.$("div.flex.xs12.lg8 > h1").text()){
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
    }
    check();
    utils.urlChangeDetect(function() {
      page.url = window.location.href;
      page.UILoaded = false;
      $("#flashinfo-div, #flash-div-bottom, #flash-div-top").remove();
      check();
    });
  }
};

