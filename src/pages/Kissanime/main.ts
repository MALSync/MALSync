import {pageInterface} from "./../pageInterface";

export const Kissanime: pageInterface = {
    domain: 'http://kissanime.ru',
    database: 'Kissanime',
    type: 'anime',
    isSyncPage: function(url){
      if(typeof utils.urlPart(url, 5) != 'undefined'){
          if($('#centerDivVideo').length){
              return true;
          }
      }
      return false;
    },
    sync:{
      getTitle: function(url){return Kissanime.sync.getIdentifier(url)},
      getIdentifier: function(url){return utils.urlPart(url, 4);},
      getEpisode: function(url){
        var episodePart = utils.urlPart(url, 5);
        var temp = [];
        temp = episodePart.match(/[e,E][p,P][i,I]?[s,S]?[o,O]?[d,D]?[e,E]?\D?\d{3}/);
        if(temp !== null){
            episodePart = temp[0];
        }
        temp = episodePart.match(/\d{3}/);
        if(temp === null){
            temp = episodePart.match(/\d{2,}\-/);
            if(temp === null){
                episodePart = 0;
            }else{
                episodePart = temp[0];
            }
        }else{
            episodePart = temp[0];
        }
        return episodePart;
      },
    },
    overview:{
      getTitle: function(){return $('.bigChar').first().text();},
      getIdentifier: function(url){return Kissanime.sync.getIdentifier(url)},
      uiSelector: function(selector){selector.insertAfter($(".bigChar").first());},
      list:{
        elementsSelector: function(){return $(".trAnime");},
        elementUrl: function(selector){return '';},
        elementEp: function(selector){return 1;},
      }
    },
    init(page){
      api.storage.addStyle(require('./style.less').toString());
      $(document).ready(function(){page.handlePage()});
    }
};
