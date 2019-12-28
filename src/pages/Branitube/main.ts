import { pageInterface } from "./../pageInterface";
export const Branitube: pageInterface = {
  name: "Branitube",
  domain: "https://www.branitube.net",
  type: "anime",
  isSyncPage: function(url) {
    if (url.split("/")[3] === "watch") {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url){
      if(getType() !== "anime") {
        return j.$('.nomeAnime').text() + " "+ getType();
      } else {
        return j.$('.nomeAnime').text();
      }
    },
    getIdentifier: function(url) {
      return j.$('.nomeAnime').data('anid') +"?"+ getType().replace(/\s/gm,"");
    },
    getOverviewUrl: function(url){
      return Branitube.domain+'/animes/'+ j.$('.nomeAnime').data('anid');
    },
    getEpisode: function(url){
      if(getType().indexOf("movie") == -1) {
        return j.$(".epInfo").text().replace(/\D+/g, "");
      } else {
        return 1;
      }
    }
  },
  overview:{
    getTitle: function(url){
      if(getType() !== "anime") {
        return j.$('div.animeInfos > ul > li.largeSize').text() + " "+ getType();
      } else {
        return j.$('div.animeInfos > ul > li.largeSize').text();
      }
    },
    getIdentifier: function(url){
      return url.split("/")[4] +"?"+ getType();
    },
    uiSelector: function(selector){ j.$('<div class="animeResult" style="margin-bottom: 5px; padding: 5px"> <p id="malp">'+selector.html()+'</p></div>').prependTo(j.$("div.areaEpsList").first());
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
      if(page.url.split("/")[6] !== "filmes" && j.$("div.areaTypesList.no-padding > ul > li > a.active > span.totalEps").text().replace(/\D+/g, "") !== "0") {
        page.handlePage();
      }
    });
  }
};

function getType() {
  if(window.location.href.split("/")[3] === "watch") {
    var epInfo = j.$(".epInfo").text().toLowerCase();
  } else {
    var epInfo = j.$("div.areaTypesList.no-padding > ul > li > a.active").text().toLowerCase();
  }
  if(epInfo.indexOf("ova") !== -1) {
    return "ova";
  } else if (epInfo.indexOf("especial") !== -1 || epInfo.indexOf("especiais") !== -1) {
    return "special";
  } else if (epInfo.indexOf("filme") !== -1) {
    return "movie " + epInfo.replace(/\D+/g, "").replace(/^0+/gm, '');
  } else {
    return "anime";
  }
}
