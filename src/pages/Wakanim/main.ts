import { pageInterface } from "./../pageInterface";

export const Wakanim: pageInterface = {
  name: "Wakanim",
  domain: "https://wakanim.tv",
  type: "anime",
  isSyncPage: function(url) {
    if (j.$("body > section.episode > div > div > div.episode_main > div.episode_video > div")) {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url){return j.$("body > section.episode > div > div > div.episode_info > h1 > span.episode_title").text()},
    getIdentifier: function(url) {
      return url.split("/")[8];
    },
    getOverviewUrl: function(url){return Wakanim.domain+j.$("body > section.episode > div > div > div.episode_info > div.episode_buttons > a:nth-child(2)").attr('href')},
    
    getEpisode:function(url){return j.$("body > section.episode > div > div > div.episode_info > h1 > span.episode_subtitle > span:nth-child(1) > span").text()
    },

    nextEpUrl: function(url){return j.$("body > section.episode > div > div > div.episode_main > div.episode_video > div > div.episode-bottom > div.episodeNPEp-wrapperBlock > a.episodeNPEp.episodeNextEp.active").attr('href')},
  },
  overview:{
    getTitle: function(url){return j.$("body > section.episode > div > div > div.episode_info > h1 > span.episode_title").text()},
    getIdentifier: function(url){
      return url.split("/")[8].trim();
    },
    uiSelector: function(selector){
      selector.insertAfter(j.$("body > section.episode > div > div > div.episode_info").first());
    },
  },
  init(page){
    if(document.title == "Just a moment..."){
      con.log("loading");
      page.cdn();
      return;
    }
    api.storage.addStyle(require('./style.less').toString());
    j.$(document).ready(function(){
      if (j.$("#jwplayer-container")[0]){
        page.handlePage();
      }
    });
  }
};
