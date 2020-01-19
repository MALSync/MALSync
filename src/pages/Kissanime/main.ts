import {pageInterface} from "./../pageInterface";

export const Kissanime: pageInterface = {
    name: 'kissanime',
    domain: 'https://kissanime.ru',
    database: 'Kissanime',
    type: 'anime',
    isSyncPage: function(url){
      if(typeof utils.urlPart(url, 5) != 'undefined'){
          if(j.$('#centerDivVideo').length){
              return true;
          }
      }
      return false;
    },
    sync:{
      getTitle: function(url){return j.$('#navsubbar a').first().text().replace('Anime', '').replace('information', '').trim()},
      getIdentifier: function(url){return utils.urlPart(url, 4);},
      getOverviewUrl: function(url){return url.split('/').slice(0,5).join('/');},
      getEpisode: function(url){
        var episodePart = utils.urlPart(url, 5);
        episodePart = episodePart.replace(/1080p/i, ' ').replace(/720p/i, ' ');
        var temp = [];
        temp = episodePart.match(/[e,E][p,P][i,I]?[s,S]?[o,O]?[d,D]?[e,E]?\D?\d+/);
        if(temp !== null){
            episodePart = temp[0];
        }
        temp = episodePart.match(/\d+$/);
        if(temp === null){
            temp = episodePart.match(/\d{2,}\-/);
            if(temp === null){
                episodePart = 1;
            }else{
                episodePart = temp[0];
            }
        }else{
            episodePart = temp[0];
        }
        return episodePart;
      },
      nextEpUrl: function(url){
        var nextEp = j.$('#selectEpisode option:selected').next().val();
        if(!nextEp) return nextEp;
        return url.replace(/\/[^\/]*$/, '') +'/'+ nextEp;
      }
    },
    overview:{
      getTitle: function(){return j.$('.bigChar').first().text();},
      getIdentifier: function(url){return Kissanime.sync.getIdentifier(url)},
      uiSelector: function(selector){selector.insertAfter(j.$(".bigChar").first());},
      list:{
        offsetHandler: true,
        elementsSelector: function(){return j.$(".listing tr")},
        elementUrl: function(selector){return utils.absoluteLink(selector.find('a').first().attr('href'), Kissanime.domain);},
        elementEp: function(selector){
          var url = Kissanime.overview!.list!.elementUrl(selector);
          if(/_ED|_OP|_Ending|_Opening|_Preview|_Trailer/i.test(selector.find('a').first().text())) return NaN;
          return Kissanime.sync.getEpisode(url);
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
      j.$(document).ready(function(){page.handlePage()});
    }
};
