import {pageInterface} from "./../pageInterface";

export const Kissmanga: pageInterface = {
    name: 'kissmanga',
    domain: 'https://kissmanga.com',
    database: 'Kissmanga',
    type: 'manga',
    isSyncPage: function(url){
      if(typeof utils.urlPart(url, 5) != 'undefined'){
        return true;
      }
      return false;
    },
    sync:{
      getTitle: function(url){return j.$('#navsubbar a').first().text().replace('Manga', '').replace('information', '').trim();},
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
      nextEpUrl: function(url){return j.$('img.btnNext').first().parent().attr('href');
      },
    },
    overview:{
      getTitle: function(){return j.$('.bigChar').first().text();},
      getIdentifier: function(url){return Kissmanga.sync.getIdentifier(url)},
      uiSelector: function(selector){selector.insertAfter(j.$(".bigChar").first());},
      list:{
        offsetHandler: true,
        elementsSelector: function(){return j.$(".listing tr");},
        elementUrl: function(selector){return utils.absoluteLink(selector.find('a').first().attr('href'), Kissmanga.domain);},
        elementEp: function(selector){
          var url = Kissmanga.overview!.list!.elementUrl(selector);
          if(/_ED/.test(url)) return NaN;
          return Kissmanga.sync.getEpisode(url);
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
