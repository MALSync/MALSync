import { pageInterface } from "./../pageInterface";

export const AnimesVision: pageInterface = {
  name: "AnimesVision",
  domain: "https://animesvision.biz",
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
      return j.$("#episodes-sv-1 > li > div.sli-name > a").attr("href") || "";
    },
    getEpisode: function(url){
      var episodetemp = url.split("/")[5].replace(/\D+/,"");

      if(!episodetemp) return NaN;

      return Number(episodetemp)
    },
    nextEpUrl: function(url) {
      return utils.absoluteLink(j.$("#nextEp").attr("href"),AnimesVision.domain);
    }
  },
  overview: {
    getTitle: function(url){return utils.getBaseText($('div.goblock.detail-anime > div.gobread > ol > li.active > span')).replace(/Dublado/gmi,"").replace(/[\s-\s]*$/,"").trim();},
    getIdentifier: function(url){return utils.urlPart(url,4)},
    uiSelector: function(selector){selector.insertAfter(j.$("div.goblock.detail-anime > div.goblock-content.go-full > div.detail-content"));},
    list:{
      offsetHandler: false,
      elementsSelector: function(){
        return j.$("#episodes-sv-1 > li.ep-item");
      },
      elementUrl: function(selector){
        return selector.find('a').first().attr('href') || "";
      },
      elementEp: function(selector){
        return selector.find('a').first().attr('href').split("/")[5].replace(/\D+/,"");
      }
    }
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
