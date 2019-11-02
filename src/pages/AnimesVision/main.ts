import { pageInterface } from "./../pageInterface";

export const AnimesVision: pageInterface = {
  name: "AnimesVision",
  domain: "https://www.animesvision.com.br",
  type: "anime",
  isSyncPage: function(url) {
    if (url.split("/")[5] !== undefined) {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url){return utils.getBaseText($('div.goblock.play-anime > div.gobread > ol > li.active > h1')).replace(/Dublado/gmi,"").replace(/[\s-\s]*$/,"").trim();},
    getIdentifier: function(url) {
      return url.split("/")[4];
    },
    getOverviewUrl: function(url){
      return j.$("#episodes-sv-1 > li > div.sli-name > a").attr("href");
    },
    getEpisode: function(url){
      return url.split("/")[5].replace(/\D+/,"");
    },
    nextEpUrl: function(url) {
      return utils.absoluteLink(j.$("#nextEp").attr("href"),AnimesVision.domain);
    }
  },
  overview: {
    getTitle: function(url){return utils.getBaseText($('div.goblock.detail-anime > div.gobread > ol > li.active > span')).replace(/Dublado/gmi,"").replace(/[\s-\s]*$/,"").trim();},
    getIdentifier: function(url){return utils.urlPart(url,4)},
    uiSelector: function(selector){selector.insertAfter(j.$("div.goblock.detail-anime > div.goblock-content.go-full > div.detail-content"));},
  },
  init(page){
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function(){
      if(page.url.split("/")[3] === "animes" || page.url.split("/")[3] === "filmes") {
        page.handlePage();
      }
    });
  }
};
