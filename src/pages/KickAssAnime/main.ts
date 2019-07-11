import { pageInterface } from "./../pageInterface";

export const KickAssAnime: pageInterface = {
  name: "KickAssAnime",
  domain: "https://www17.kickassanime.io",
  type: "anime",
  isSyncPage: function(url) {
    if (url.split("/")[5] == null) {
      return false;
    } else {
      return true;
    }
  },
  sync: {
    getTitle: function(url){
      return utils.getBaseText($('#animeInfoTab > a'))
    },
    getIdentifier: function(url) {
      return url.split("/")[4];
    },
    getOverviewUrl: function(url){
      return KickAssAnime.domain+'/anime/'+KickAssAnime.sync.getIdentifier(url);
    },
    getEpisode: function(url)
    {
      var episodePart = url.split("/")[5];
      if(episodePart.length){
        var temp = episodePart.match(/episode-\d*/g);
        if(temp !== null){
          return temp[0].replace(/\D+/g, "");
        }
      }
    },
  },
  overview:{
    getTitle: function(url){
      return j.$("h1.title").text();
    },
    getIdentifier: function(url){
      return url.split("/")[4];
    },
    uiSelector: function(selector){
      selector.insertAfter(j.$("div.anime-info.border.rounded.mb-3").first());
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
      if (page.url.split("/")[3] == "anime") {
        page.handlePage();
      }
    });
  }
};
