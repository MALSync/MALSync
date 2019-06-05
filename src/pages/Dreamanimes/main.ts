import { pageInterface } from "./../pageInterface";

export const Dreamanimes: pageInterface = {
  name: "Dreamanimes",
  domain: "https://dreamanimes.com.br",
  type: "anime",
  isSyncPage: function(url) {
    if (url.split("/")[3] === "online") {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url){return j.$("#anime_name").text()},
    getIdentifier: function(url){return utils.urlPart(url, 5);},
    getOverviewUrl: function(url){
      return Dreamanimes.domain+'/anime-info/'+Dreamanimes.sync.getIdentifier(url);
    },
    getEpisode: function(url){return parseInt(utils.urlPart(url, 7));},
  },
  init(page){
    api.storage.addStyle(require('./style.less').toString());
    j.$(document).ready(function(){
      page.handlePage();
    });
  }
};
