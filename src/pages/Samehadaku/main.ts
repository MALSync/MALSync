import { pageInterface } from "./../pageInterface";

export const Samehadaku: pageInterface = {
  name: "Samehadaku",
  domain: "https://samehadaku.vip",
  type: "anime",
  isSyncPage: function(url) {
    if (url.split("/")[3] === "anime") {
      return false;
    } else {
      return true;
    }
  },
  sync: {
    getTitle: function(url){return j.$("div.infoeps > div.episodeinf > div.infoanime > div > div.infox > h2").text()},
    getIdentifier: function(url) {
      return Samehadaku.sync.getOverviewUrl(url).split("/")[4];
    },
    getOverviewUrl: function(url){
      return utils.absoluteLink(j.$("div.naveps > div.nvs.nvsc > a").attr("href"),Samehadaku.domain);
    },
    getEpisode: function (url) {
      let urlParts = url.split("/");
  
      if (!urlParts || urlParts.length === 0) return NaN;
  
      let episodePart = urlParts[3];
  
      if (episodePart.length === 0) return NaN;
  
      let temp = episodePart.match(/episode-\d+/gi);
  
      if (!temp || temp.length === 0) return NaN;
  
      return Number(temp[0].replace(/\D+/g, ""));
    },
    nextEpUrl: function(url){
      let href = j.$("div.naveps > div.nvs.rght > a:not('.nonex')").attr("href");
      if(href) return utils.absoluteLink(href,Samehadaku.domain)
    }
  },
  overview:{
    getTitle: function(url){
      return j.$("#infoarea > div > div.infoanime > div.infox > h1.entry-title").text();
    },
    getIdentifier: function(url){
      return utils.urlPart(url,4);
    },
    uiSelector: function(selector){
      selector.insertBefore(j.$("#infoarea > div > div.infoanime > div.infox > h1.entry-title"));
    },
    list:{
      offsetHandler: false,
      elementsSelector: function(){
        return j.$("div.lstepsiode.listeps > ul > div > div > li");
      },
      elementUrl: function(selector){
        return selector.find("div.epsright > span.eps > a").attr("href") || "";
      },
      elementEp: function(selector){
        return Samehadaku.sync.getEpisode(Samehadaku.overview!.list!.elementUrl(selector));
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
      if(page.url.split("/")[3] === "anime" || (j.$("div.player-area.widget_senction > div.plarea").length && j.$("div.infoeps > div.episodeinf > div.infoanime > div > div.infox > h2").length && j.$("div.naveps > div.nvs.nvsc > a").length)) {
        page.handlePage();
      }
    });
  }
};
