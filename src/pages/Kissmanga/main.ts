import {pageInterface} from "./../pageInterface";

export const Kissmanga: pageInterface = {
    name: 'kissmanga',
    domain: 'http://kissmanga.com',
    database: 'Kissmanga',
    type: 'manga',
    isSyncPage: function(url){
      if(typeof utils.urlPart(url, 5) != 'undefined'){
        return true;
      }
      return false;
    },
    sync:{
      getTitle: function(url){return utils.urlPart(url, 4);},
      getIdentifier: function(url){return utils.urlPart(url, 4);},
      getOverviewUrl: function(url){return url.split('/').slice(0,5).join('/');},
      getEpisode: function(url){
        var episodePart = utils.urlPart(url, 5);
        //var temp = [];
        /*try{
          episodePart = episodePart.replace(j.$('.bigChar').attr('href').split('/')[2],'');
        }catch(e){
          episodePart = episodePart.replace(kalUrl.split("/")[4],'');
        }*/
        var temp = episodePart.match(/[c,C][h,H][a,A]?[p,P]?[t,T]?[e,E]?[r,R]?\D?\d+/);
        if(temp === null){
          episodePart = episodePart.replace(/[V,v][o,O][l,L]\D?\d+/,'');
          temp = episodePart.match(/\d{3}/);
          if(temp === null){
            temp = episodePart.match(/\d+/);
            if(temp === null){
              episodePart = 0;
            }else{
              episodePart = temp[0];
            }
          }else{
            episodePart = temp[0];
          }
        }else{
          episodePart = temp[0].match(/\d+/)[0];
        }
        return episodePart;
      },
      getVolume: function(url){
        try{
          url = url.match(/[V,v][o,O][l,L]\D?\d{3}/)[0];
          url = url.match(/\d+/)[0].slice(-3);
        }catch(e){
         return;
        }
        return url;
      },
    },
    overview:{
      getTitle: function(){return j.$('.bigChar').first().text();},
      getIdentifier: function(url){return Kissmanga.sync.getIdentifier(url)},
      uiSelector: function(selector){selector.insertAfter(j.$(".bigChar").first());},
      list:{
        elementsSelector: function(){return j.$(".listing tr").filter(() => {return j.$(this).find('a').length > 0});},
        elementUrl: function(selector){return utils.absoluteLink(selector.find('a').first().attr('href'), Kissmanga.domain);},
        elementEp: function(selector){
          var url = Kissmanga.overview!.list!.elementUrl(selector);
          if(/_ED/.test(url)) return NaN;
          return Kissmanga.sync.getEpisode(url);
        },
      }
    },
    init(page){
      api.storage.addStyle(require('./style.less').toString());
      j.$(document).ready(function(){page.handlePage()});
    }
};
