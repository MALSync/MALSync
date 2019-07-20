import { pageInterface } from "./../pageInterface";

export const AnimePlanet: pageInterface = {
  name: "AnimePlanet",
  domain: "https://www.anime-planet.com",
  type: "anime",
  isSyncPage: function(url) {
    if (url.split("/")[6] == null) {
      return false;
    } else {
      return true;
    }
  },
  sync: {
    getTitle: function(url){return j.$("h2.sub a").text()},
    getIdentifier: function(url) {
      return url.split("/")[4];
    },
    getOverviewUrl: function(url){
      return AnimePlanet.domain + j.$("h2.sub a").attr('href');
    },
    getEpisode: function(url){
      var episodePart = utils.getBaseText($('h2.sub')).replace(/\r?\n|\r/g,"");
      if(episodePart.length){
        var temp = episodePart.match(/.*-/g);
        if(temp !== null){
          return temp[0].replace(/\D+/g, "");
        }
      }
    },
    uiSelector: function(selector){
      selector.insertBefore(j.$("#siteContainer > nav").first());
    },
  },
  overview:{
    getTitle: function(url){
      return j.$("#siteContainer > h1").text();
    },
    getIdentifier: function(url){
      return url.split("/")[4];
    },
    uiSelector: function(selector){
      selector.insertBefore(j.$("#siteContainer > nav").first());
    },
  },
  init(page){
    if(document.title == "Just a moment..."){
      con.log("loading");
      page.cdn();
      return;
    }
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function(){
      if (page.url.split("/")[3] === "anime") {
        page.handlePage();
      }
    });
  }
};
