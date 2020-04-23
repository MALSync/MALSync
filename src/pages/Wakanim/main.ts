import { pageInterface } from "./../pageInterface";

export const Wakanim: pageInterface = {
  name: "Wakanim",
  domain: "https://www.wakanim.tv",
  type: "anime",
  isSyncPage: function(url) {
    if (j.$("body > section.episode > div > div > div.episode_main > div.episode_video > div").length) {
      return true;
    } else {
      return false;
    }
  },

  sync: {
    getTitle: function(url){return Wakanim.sync.getIdentifier(url)},

    getIdentifier: function(url) {
        var ses = seasonHelper(j.$('span.episode_subtitle > span:nth-child(2)').text());
        return j.$('.episode_title').text() + ' ' + ses;
    },

    getOverviewUrl: function(url){return Wakanim.domain+j.$("body > section.episode > div > div > div.episode_info > div.episode_buttons > a:nth-child(2)").attr('href')},

    getEpisode:function(url){return j.$("body > section.episode > div > div > div.episode_info > h1 > span.episode_subtitle > span > span").text()
    },

    nextEpUrl: function(url){return j.$("body > section.episode > div > div > div.episode_main > div.episode_video > div > div.episode-bottom > div.episodeNPEp-wrapperBlock > a.episodeNPEp.episodeNextEp.active").attr('href')},
  },
  
  overview:{
    getTitle: function(url){return Wakanim.overview!.getIdentifier(url)},
    getIdentifier: function(url){
        var secondPart = seasonHelper(j.$('#list-season-container > div > select > option:selected').text());
        return j.$('.SerieV2-body .SerieHeader-thumb').attr('alt')  + ' ' + secondPart;

    },

    uiSelector: function(selector){
      selector.insertBefore(j.$("#nav-show").first());
    },

  list:{
    offsetHandler: true,
    elementsSelector: function(){return j.$("li.-big");},
    elementUrl: function(selector){return utils.absoluteLink(selector.find('a').attr('href'), Wakanim.domain);},
    elementEp: function(selector){
      var url = Wakanim.overview!.list!.elementUrl(selector);
      return episodeHelper(url, selector.find('a').attr('title').trim());
    },
  }
},

init(page){
  if(document.title == "Just a moment..."){
    con.log("loading");
    page.cdn();
    return;
  }

  api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
  if (page.url.split("/")[6] === "show" || page.url.split("/")[6] === "episode") {
    utils.waitUntilTrue(
      function() {
        if (j.$('body > div.SerieV2 > section > div.container > div > div.SerieV2-content').length || j.$('#jwplayer-container').length){
          return true;
        } else {
          return false;
        }
      },
      function() {
        page.handlePage();
      }
      );
  }

  utils.urlChangeDetect(function() {
    page.url = window.location.href;
    if (page.url.split("/")[6] === "show") {
      utils.waitUntilTrue(
        function() {
          if (j.$('#list-season-container').length){
            page.UILoaded = true;
            return true;
          } else {
            return false;
          }
        },
        function() {
          page.handlePage();
        }
        );
    }
  });
}
};

function seasonHelper(text){
    //Check if season is split in 2 cour.
    //If yes, so rename "Cour 2" as "Part 2 " for better detection.
    //If no, simply remove "Cour".

    if (text.includes("Cour")){
        var temp = text.match(/Cour (\d+)/);
        if (temp[1] == 2)
        {
            return text.replace(temp[0], 'Part 2 ').trim().replace('-','');
        }
        else
        {
            return text.replace(/Cour \d+/, '').trim().replace('-','');
        }
    }
    else
    {
        return text;
    }
}

function episodeHelper(url, episodeText){
  var episodePart = utils.urlPart(url, 8);

  try{
    if(/\d+\.\d+/.test(episodeText)){
      episodePart = 'episode'+episodeText.match(/\d+\.\d+/)[0];
    }
  }catch(e){
    con.error(e);
  }

  var temp = [];
  temp = episodePart.match(/([e,E][p,P][i,I]?[s,S]?[o,O]?[d,D]?[e,E]?|[f,F][o,O][l,L][g,G]?[e,E])\D?\d+/);

  if(temp !== null){
    episodePart = temp[0];
  }else{
    episodePart = '';
  }
 
  temp = episodePart.match(/\d+/);

  if(temp === null){
    episodePart = 1;
  }else{
    episodePart = temp[0];
  }

  return episodePart;
}
