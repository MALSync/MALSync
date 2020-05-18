import { pageInterface } from "./../pageInterface";

export const animestrue: pageInterface = {
  name: "animestrue",
  domain: "https://animestrue.site",
  type: "anime",
  isSyncPage: function(url) {
    if (typeof url.split("/")[6] !== "undefined" && url.split("/")[6].indexOf("episodio") !== -1) {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url){
      if(Number(url.split("/")[5].match(/\d+/gmi)) > 1) {
        return utils.getBaseText($("div.anime-nome > a, #pageTitle").first()) + " season " + url.split("/")[5].match(/\d+/gmi);
      }

      return utils.getBaseText($("div.anime-nome > a, #pageTitle").first());
    },
    getIdentifier: function(url) {
      return url.split("/")[4] + "?s=" + url.split("/")[5].match(/\d+/gmi);
    },
    getOverviewUrl: function(url){
      return animestrue.domain + "/anime/" + url.split("/")[4] + "/" + url.split("/")[5];
    },
    getEpisode: function(url){
      return  Number(url.split("/")[6].match(/\d+/gmi));
    },
    nextEpUrl: function(url){
      var nextEp = j.$('ul.episodios > li.active').next().find("div > a").attr('href');
      if(!nextEp) return undefined;
      return utils.absoluteLink(nextEp,animestrue.domain);
    },
  },
  overview:{
    getTitle: function(url){
      return animestrue.sync.getTitle(url);
    },
    getIdentifier: function(url){
      return animestrue.sync.getIdentifier(url);
    },
    uiSelector: function(selector){
      selector.insertBefore(j.$("#pageTitle").first());
    },
    list:{
      offsetHandler: false,
      elementsSelector: function(){
        return j.$("#listar_animes > li > div > div > table > tbody > tr");
      },
      elementUrl: function(selector){
        return utils.absoluteLink(selector.find('td > a').first().attr('href'),animestrue.domain);
      },
      elementEp: function(selector){
        return animestrue.sync.getEpisode(utils.absoluteLink(selector.find('td > a').first().attr('href'),animestrue.domain));
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
