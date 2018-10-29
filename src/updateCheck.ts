import {syncPage} from "./pages/syncPage";

con.log('updateCheck.ts');

api.settings.init()
  .then(()=>{
    var url = new URL(window.location.href);
    var id = url.searchParams.get("mal-sync-background");
    con.log(id);
    var episodeList = [];

    var page = new syncPage(window.location.href);
    page.handlePage = async function(){con.log('handlePage');
      if (typeof(this.page.overview) != "undefined" && typeof(this.page.overview.list) != "undefined"){
        var elementUrl = this.page.overview.list.elementUrl;
        var tempEpisodeList = j.$.map( this.getEpList(), function( val, i ) {if(typeof(val) != "undefined"){return elementUrl(val)}return '-';});

        var changed = false;
        for (var key in tempEpisodeList) {
          var tempEpisode = tempEpisodeList[key];
          if(tempEpisode != '-' && (episodeList[key] == '-' || typeof episodeList[key] == 'undefined')){
            episodeList[key] = tempEpisode;
            changed = true;
          }
        }
        //episodeList = episodeList.map(x => Object.assign(x, tempEpisodeList.find(y => y.id == x.id && x == '-')));

        con.log("Episode List", episodeList);
        if(typeof this.page.overview.list.paginationNext !== 'undefined' && changed){
          con.log('Pagination next');
          var This = this;
          try{
            if(this.page.overview.list.paginationNext()){
              setTimeout(function(){
                This.handlePage();
              }, 500);
            }else{
              setTimeout(function(){
                This.handlePage();
              }, 500);
            }
          }catch(e){
            con.error(e);
            setTimeout(function(){
              This.handlePage();
            }, 500);
          }
        }else{
          con.log('send');
          api.request.sendMessage({name: "iframeDone", id: id, epList: episodeList});
        }
      }
    }
    page.init();
  });
