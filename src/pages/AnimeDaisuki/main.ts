import { pageInterface } from "./../pageInterface";

export const AnimeDaisuki: pageInterface = {
  name: "AnimeDaisuki",
  domain: "https://animedaisuki.moe",
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
      return j.$("nav.Brdcrmb.fa-home a:nth-child(3)").text().trim();
    },
    getIdentifier: function(url) {
      const anchorHref = j.$("nav.Brdcrmb.fa-home a:nth-child(3)").attr('href');

      if(!anchorHref) return "";

      return anchorHref.split("/")[3];
    },
    getOverviewUrl: function(url){
      return AnimeDaisuki.domain + (j.$("nav.Brdcrmb.fa-home a:nth-child(3)").attr('href') || "");
    },
    getEpisode: function(url){
      return Number(j.$("h2.SubTitle").text().replace(/\D+/g, ""));
    },
    nextEpUrl: function(url){
      var href = j.$(".CapNv .CapNvNx").first().attr('href')
      if(typeof href !== 'undefined'){
        return AnimeDaisuki.domain+href;
      }
    },
  },
  overview:{
    getTitle: function(url){
      return j.$("h2.Title").text().trim();
    },
    getIdentifier: function(url){
      return url.split("/")[5];
    },
    uiSelector: function(selector){
      selector.insertAfter(j.$("section.WdgtCn").first());
    },
    list:{
      offsetHandler: false,
      elementsSelector: function(){
        return j.$("ul.ListCaps > li.fa-play-circle:not(.Next,.Issues)");
      },
      elementUrl: function(selector){
        return utils.absoluteLink(selector.find('a').first().attr('href'),AnimeDaisuki.domain);
      },
      elementEp: function(selector){
        return Number(selector.find('a > p').first().text().replace(/\D+/g, ""));
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
      if(page.url.split("/")[3] === "watch" || page.url.split("/")[3] === "anime") {
        page.handlePage();
      }
    });
  }
};
