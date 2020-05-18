import { pageInterface } from "./../pageInterface";

export const RiiE: pageInterface = {
  name: "RiiE",
  domain: "https://www.riie.net",
  type: "anime",
  isSyncPage: function(url) {
    if (j.$("#lightsVideo")[0]) {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url){return j.$("#content > div.postarea > div > div.post > div:nth-child(1) > b").text().replace(/episode.*/gmi,"").trim()},
    getIdentifier: function(url) {
      return RiiE.sync.getOverviewUrl(url).split("/")[4];
    },
    getOverviewUrl: function(url){
      return j.$("#content > div.postarea > div > div.post > div.newzone > div.right > a:not([rel])").first().attr('href');
    },
    getEpisode: function (url) {
      let urlParts = url.split("/");

      if (!urlParts || urlParts.length === 0) return NaN;

      let episodePart = urlParts[3];

      if (episodePart.length === 0) return NaN;

      let temp = episodePart.match(/-episode-\d*-/gi);

      if (!temp || temp.length === 0) return NaN;

      return Number(temp[0].replace(/\D+/g, ""));
    },
    nextEpUrl: function(url){
      var href = $("a[rel='next']").first().attr('href');
      if(typeof href !== 'undefined'){
        return utils.absoluteLink(href, RiiE.domain);
      }
    },
  },
  overview:{
    getTitle: function(url){
      return url.split("/")[4].replace(/-/g, " ");
    },
    getIdentifier: function(url){
      return url.split("/")[4];
    },
    uiSelector: function(selector){
      selector.insertAfter(j.$("#content > div.naru > div.areaxb").first());
    },
    list:{
      offsetHandler: false,
      elementsSelector: function(){
        return j.$("div.episodelist > ul > li");
      },
      elementUrl: function(selector){
        return utils.absoluteLink(selector.find('span.leftoff > a').first().attr('href'),RiiE.domain);
      },
      elementEp: function(selector){
        return selector.find('span.leftoff > a').first().text().replace(/\D+/,"");
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
      if (page.url.split("/")[3] == "anime" || j.$("#lightsVideo")[0] && j.$("#content > div.postarea > div > div.post > div.newzone > div.right")[0])
        page.handlePage();
    });
  }
};
