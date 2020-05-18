import { pageInterface } from "./../pageInterface";

export const AnimeKisa: pageInterface = {
  name: "AnimeKisa",
  domain: "https://animekisa.tv",
  type: "anime",
  isSyncPage: function(url) {
    if (url.split("/")[3] !== null && j.$("div.c a.infoan2")[0] && j.$("#playerselector option:selected")[0]) {
      return true;
    } else {
      return false;
    }
  },
  isOverviewPage: function(url) {
    return url.split("/")[3] !== null && j.$("div.notmain > div > div.infobox > div.infoboxc > div.infodesbox > h1")[0] && j.$("div.notmain > div > div.infobox > div.infoepboxmain")[0];
  },
  sync: {
    getTitle: function(url){return j.$("div.c a.infoan2").text().trim()},
    getIdentifier: function(url) {
      return j.$("div.c a.infoan2").attr("href");
    },
    getOverviewUrl: function(url){
      return AnimeKisa.domain + "/" + j.$("div.c a.infoan2").attr("href");
    },
    getEpisode: function(url){
      return j.$("#playerselector option:selected").text().replace(/\D+/g, "");
    },
    nextEpUrl: function(url){
      var num = $("#playerselector").find("option:selected").next().attr('value');

      if(!num) return;

      var href = url.replace(/\d+$/, num);

      if(typeof num !== 'undefined' && href !== url){
        return utils.absoluteLink(href, AnimeKisa.domain);
      }
    },
  },
  overview:{
    getTitle: function(url){
      return j.$("div.notmain > div > div.infobox > div.infoboxc > div.infodesbox > h1").text().trim();
    },
    getIdentifier: function(url){
      return url.split("/")[3];
    },
    uiSelector: function(selector){selector.insertBefore(j.$(".infoepboxmain").first());},
    getMalUrl: function(provider) {
      var url = j.$('a[href^="https://myanimelist.net/anime/"]').not("#malRating").first().attr('href');
      if(url) return url;
      if(provider === 'ANILIST'){
        url = j.$('a[href^="https://anilist.co/anime/"]').not("#malRating").first().attr('href');
        if(url) return url;
      }
      if(provider === 'KITSU'){
        url = j.$('a[href^="https://kitsu.io/anime/"]').not("#malRating").first().attr('href');
        if(url) return url;
      }
      return false;
    },
    list:{
      offsetHandler: false,
      elementsSelector: function(){
        return j.$("div.infoepbox > a");
      },
      elementUrl: function(selector){
        return AnimeKisa.domain + "/" + selector.find('.infoepmain').first().parent().attr('href');
      },
      elementEp: function(selector){
        return selector.find('div.infoept2r > div, div.infoept2 > div').first().text();
      }
    }
  },
  init(page){
    if(document.title == "Just a moment..."){
      con.log("loading");
      page.cdn();
      return;
    }
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function(){
      page.handlePage();
   });
  }
};
