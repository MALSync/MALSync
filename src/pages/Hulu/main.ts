import { pageInterface } from "./../pageInterface";

var episode:number = 0;
var season:number = 0;
var huluId:any = undefined;
var name:any = undefined;
var movie:boolean = false;

export const Hulu: pageInterface = {
  name: "Hulu",
  domain: "https://www.hulu.com",
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
      return name
    },
    getIdentifier: function(url) {
      return huluId + "?s=" + season;
    },
    getOverviewUrl: function(url){
      if(movie) {
        return Hulu.domain +"/movie/" + huluId;
      } else {
        return Hulu.domain +"/series/" + huluId;
      }
    },
    getEpisode: function(url){
      return episode;
    }
  },
  overview:{
    getTitle: function(url){
      return name;
    },
    getIdentifier: function(url){
      return huluId + "?s=" + season;
    },
    uiSelector: function(selector){
      selector.insertAfter(j.$("div.Details__subnav > div > div > div").first());
    },
  },
  init(page){
    if(document.title == "Just a moment..."){
      con.log("loading");
      page.cdn();
      return;
    }
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());

    utils.urlChangeDetect(async function() {
      page.url = window.location.href;
      page.UILoaded = false;
      $("#flashinfo-div, #flash-div-bottom, #flash-div-top").remove();
      con.log("change")
      if(page.url.split("/")[3] === "watch" || page.url.split("/")[3] === "series" || page.url.split("/")[3] === "movie") {
        con.log("jappp")
        if(await checkPage()) {
          con.log("YAAAAAAAA")
          page.handlePage();
        }
      }
    });
  }
};
function checkPage(): boolean {
  var reqUrl = "https://discover.hulu.com/content/v3/entity?language=en&eab_ids=" + utils.urlPart(window.location.href,4);

  return api.request.xhr('GET', reqUrl).then((response) => {
    var json =JSON.parse(response.responseText)
    if (json.items[0].genre_names.includes("Anime") || json.items[0].genre_names.includes("Animation")) {

      episode = json.items[0].number;

      if(json.items[0].season) {
        //if its a series
        huluId = json.items[0].series_id;
        season = json.items[0].season;
        name = json.items[0].series_name;
        movie = false;
      } else {
        //if its a movie
        huluId = json.items[0].id;
        season = 1;
        name = json.items[0].name;
        movie = true;
      }
    }
    if(season > 1) {
      var reqUrl2 = "https://discover.hulu.com/content/v4/hubs/series/" + huluId + "/season/"+ season + "?offset=0&limit=999&schema=9&referralHost=production";
      return api.request.xhr('GET', reqUrl2).then((r) => {
       var json2 =JSON.parse(r.responseText)
       episode = episode - json2.items[0].number + 1;
       name = name + " season " + season;
       return typeof huluId !== 'undefined';
     });
    } else {
      return typeof huluId !== 'undefined';
    }
    con.log(huluId);
    con.log(name);
    con.log("episode: " + episode + " season: " + season) 
  });
}
