import { pageInterface } from "./../pageInterface";

export const AnimeFever: pageInterface = {
  name: "AnimeFever",
  domain: "https://www.animefever.tv",
  type: "anime",
  isSyncPage: function(url) {
    if (url.split("/")[5] === "episode") {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url){return j.$("div.jw-wrapper.jw-reset > div.jw-controls.jw-reset > div.player-episode-info > div > a").text()},
    getIdentifier: function(url) {
      return url.split("/")[4];
    },
    getOverviewUrl: function(url){
      return AnimeFever.domain + j.$("div.jw-wrapper.jw-reset > div.jw-controls.jw-reset > div.player-episode-info > div > a").attr("href");
    },
    getEpisode: function (url) {
      let urlParts = url.split("/");

      if(!urlParts || urlParts.length === 0) return NaN;

      let episodePart = urlParts[6];
  
      if (episodePart.length === 0) return NaN;
  
      let temp = episodePart.match(/episode-\d*/gim);
  
      if (!temp) return NaN;
      
      return Number(temp[0].replace(/\D+/g, ""));
    },
    nextEpUrl: function(url){
      var nextEp = j.$('section.relative.player-bg > div > a.next-episode').first().attr('href');
      if(!nextEp) return nextEp;
      return utils.absoluteLink(nextEp,AnimeFever.domain);
    },
  },
  overview:{
    getTitle: function(url){
      return utils.getBaseText($("#ov-anime > div.top-detail.relative > div.uk-width-expand.relative.z-10 > div > h1 > div").first()).trim();
    },
    getIdentifier: function(url){
      return utils.urlPart(url,4);
    },
    uiSelector: function(selector){selector.insertAfter(j.$("#ov-anime > div.top-detail.relative > div.uk-width-expand.relative.z-10 > div > h1").first());},
  },
  init(page){
    function checkPage() {
      page.url = window.location.href;
      page.UILoaded = false;
      $("#flashinfo-div, #flash-div-bottom, #flash-div-top").remove();
      if (page.url.split("/")[3] === "series" && typeof page.url.split("/")[4] !== undefined && page.url.split("/")[4].length > 0) {
        utils.waitUntilTrue(
          function() {
            if (j.$("div.jw-wrapper.jw-reset > div.jw-controls.jw-reset > div.player-episode-info > div > a").text() || j.$("#ov-anime > div.top-detail.relative > div.uk-width-expand.relative.z-10 > div > h1 > div").text()){
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
    if(document.title == "Just a moment..."){
      con.log("loading");
      page.cdn();
      return;
    }
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    checkPage();
    utils.urlChangeDetect(function() {
      checkPage();
    });
  }
};
