import { pageInterface } from "./../pageInterface";

export const VIZ: pageInterface = {
  name: "VIZ",
  domain: "https://www.viz.com",
  type: "manga",
  isSyncPage: function(url) {
    if ((url.split("/")[3] === "shonenjump" && url.split("/")[5] === "chapter")) {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url){return j.$("#product_row > div.bg-lighter-gray.mar-b-md.mar-b-lg--md.chapter_ribbon > div > h3 > a").text()},
    getIdentifier: function(url) {
      return j.$("#product_row > div.bg-lighter-gray.mar-b-md.mar-b-lg--md.chapter_ribbon > div > h3 > a").attr("href").split("/")[3];
    },
    getOverviewUrl: function(url){
      return VIZ.domain+ j.$("#product_row > div.bg-lighter-gray.mar-b-md.mar-b-lg--md.chapter_ribbon > div > h3 > a").attr("href");
    },
    getEpisode: function(url){
      return j.$("#product_row > div.bg-lighter-gray.mar-b-md.mar-b-lg--md.chapter_ribbon > div > h3 > span").text().replace(/\D+/g, "");
    },
  },
  overview:{
    getTitle: function(url){
      return j.$("#series-intro > div.clearfix.mar-t-md.mar-b-lg > h2").text().trim();
    },
    getIdentifier: function(url){
      return url.split("/")[5];
    },
    uiSelector: function(selector){selector.insertAfter(j.$("#series-intro").first());},
    list:{
      offsetHandler: false,
      elementsSelector: function(){
        console.log(j.$("#section0 > div > div.o_sort_container.mar-x-0.mar-x-xl--md.mar-x-xxl--lg.clearfix > div:not('.section_future_chapter')"));
        return j.$("#section0 > div > div.o_sort_container.mar-x-0.mar-x-xl--md.mar-x-xxl--lg.clearfix > div:not('.section_future_chapter')");},
      elementUrl: function(selector){
        return utils.absoluteLink(selector.find('a').first().attr('href'), VIZ.domain);},
      elementEp: function(selector){
        return selector.find('div.disp-id.mar-r-sm').text().replace(/\D+/g, "");},
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
      if (page.url.split("/")[3] === "shonenjump" && (page.url.split("/")[5] === "chapter" || page.url.split("/")[4] === "chapters")) {
        page.handlePage();
      }
    });
  }
};
