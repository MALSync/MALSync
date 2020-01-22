import { pageInterface } from "./../pageInterface";

export const Hidive: pageInterface = {
  name: "Hidive",
  domain: "https://www.hidive.com",
  type: "anime",
  isSyncPage: function(url) {
    if (url.split("/")[3] === "stream") {
	  return true;
    } else {
	  return false;
	}
  },
  sync: {
    getTitle: function(url) {
      return j.$("#TitleDetails").text();
	  },
    getIdentifier: function(url) {
	  return url.split("/")[4];
    },
    getOverviewUrl: function(url){
      return Hidive.domain+ '/tv/'+ url.split("/")[4];
    },
    getEpisode: function(url){
		var temp = url.split("/")[5];
		return Number(temp.slice(4));
    },
  },
  overview:{
    getTitle: function(url) {
      return j.$("div.text-container a").text().replace(('Score It'),'').trim();
	  },
	getIdentifier: function(url){
      return url.split("/")[4];
    },
       uiSelector: function(selector){
      j.$('<div class="container"> <p id="malp">'+selector.html()+'</p></div>').insertBefore(j.$("div.tour").first());
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
		  if (page.url.split("/")[3] === "stream" || "tv"){
		  page.handlePage()
		  }
		  
		  });
  }
};
