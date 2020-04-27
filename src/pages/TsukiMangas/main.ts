import { pageInterface } from "./../pageInterface";

let jsonData;

export const TsukiMangas: pageInterface = {
  name: "TsukiMangas",
  domain: "https://www.tsukimangas.com",
  type: "manga",
  isSyncPage: function(url) {
    return jsonData.isReaderPage;
  },
  sync: {
    getTitle: function(url){
      return jsonData.mangaName;
    },
    getIdentifier: function(url) {
      return jsonData.identifier;
    },
    getOverviewUrl: function(url){
      return jsonData.overview_url;
    },
    getEpisode: function(url){
      return jsonData.currentChapter;
    },
    nextEpUrl: function(url){
      if(jsonData.nextChapter) {
        return jsonData.nextChapter;
      }
    },
    getMalUrl: function(provider) {
      if(jsonData.myanimelistID && jsonData.myanimelistID !== "0") {
        return "https://myanimelist.net/manga/" + jsonData.myanimelistID;
      }
      if(provider === 'ANILIST' && jsonData.anilistID && jsonData.anilistID !== "0"){
        return "https://anilist.co/manga/" + jsonData.anilistID;
      }
      return false;
    },
  },
  overview: {
    getTitle: function(url){
      return TsukiMangas.sync.getTitle(url);
    },
    getIdentifier: function(url) {
      return TsukiMangas.sync.getIdentifier(url);
    },
    uiSelector: function(selector){
      selector.insertAfter(j.$('div.nowaythisexists'));
    },
    getMalUrl: function(provider) {
      return TsukiMangas.sync.getMalUrl!(provider);
    },
  },
  init(page){
    if(document.title == "Just a moment..."){
      con.log("loading");
      page.cdn();
      return;
    }
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());

    let interval;
    let oldJson = "";

    utils.fullUrlChangeDetect(function() {
      page.url = window.location.href;
      page.UILoaded = false;
      $("#flashinfo-div, #flash-div-bottom, #flash-div-top").remove();
      check();
    });

    function check() {
      clearInterval(interval);
      interval = utils.waitUntilTrue(function(){
        if(j.$('#syncData').length) {
          jsonData = JSON.parse(j.$('#syncData').text());
          if(jsonData.mangaName && JSON.stringify(jsonData) !== oldJson){
            oldJson = JSON.stringify(jsonData);
            return true;
          }
        }
      }, function(){
        if(jsonData.hasOwnProperty("isReaderPage") && jsonData.hasOwnProperty("identifier") && jsonData.hasOwnProperty("overview_url")) {
          page.handlePage();
        }
      });
    }
  }
};
