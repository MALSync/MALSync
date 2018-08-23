import {pageInterface} from "./../pageInterface";

export const Kissmanga: pageInterface = {
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
      getEpisode: function(url){
        var episodePart = utils.urlPart(url, 5);
        con.log(episodePart);
        //var temp = [];
        /*try{
          episodePart = episodePart.replace($('.bigChar').attr('href').split('/')[2],'');
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
      getTitle: function(){return $('.bigChar').first().text();},
      getIdentifier: function(url){return Kissmanga.sync.getIdentifier(url)},
      uiSelector: function(selector){selector.insertAfter($(".bigChar").first());},
    },
    init(page){
      $(document).ready(function(){page.handlePage()});
    }
};
