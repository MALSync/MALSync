import { pageInterface } from "./../pageInterface";

export const MangaNelo: pageInterface = {
  name: "MangaNelo",
  domain: "https://manganelo.com",
  database: 'MangaNelo',
  type: "manga",
  isSyncPage: function(url) {
    if (url.split("/")[3] === "chapter") {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url){
      return j.$("div.rdfa-breadcrumb > div > p > span:nth-child(4) > a > span").text()
    },
    getIdentifier: function(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl: function(url){
      return j.$("div.rdfa-breadcrumb > div > p > span:nth-child(4) > a").attr("href");
    },
    getEpisode: function(url){
      return url.split("/")[5].match(/\d+/gmi);
    }
  },
  overview:{
    getTitle: function(url){
      return j.$("div.rdfa-breadcrumb > div > p > span:nth-child(4) > a > span").text();
    },
    getIdentifier: function(url){
      return utils.urlPart(url, 4);
    },
    uiSelector: function(selector){
      j.$('<div id="malthing"> <p id="malp">'+selector.html()+'</p></div>').insertBefore(j.$("#chapter").first());
    },

    list:{
      offsetHandler: false,
      elementsSelector: function(){
        return j.$("div.row:not('div.title-list-chapter')");
      },
      elementUrl: function(selector){
        return selector.find('span:nth-child(1) > a').first().attr('href');
      },
      elementEp: function(selector){
        return selector.find('span:nth-child(1) > a').first().attr('href').split("/")[5].match(/\d+/gmi);
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
      if (page.url.split("/")[3] === "chapter" || page.url.split("/")[3] === "manga") {
        page.handlePage();
      }
    });
  }
};
