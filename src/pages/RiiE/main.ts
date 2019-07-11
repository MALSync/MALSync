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
      return j.$("#content > div.postarea > div > div.post > div.newzone > div.right > a:nth-child(2)").attr('href').split("/")[4];
    },
    getOverviewUrl: function(url){
      return j.$("#content > div.postarea > div > div.post > div.newzone > div.right > a:nth-child(2)").attr('href');
    },
    getEpisode: function(url){
      var episodePart = url.split("/")[3];
      if(episodePart.length){
        var temp = episodePart.match(/-episode-\d*-/g);
        if(temp !== null){
          return temp[0].replace(/\D+/g, "");
        }
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
