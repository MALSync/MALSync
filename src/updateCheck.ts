import {syncPage} from "./pages/syncPage";

con.log('updateCheck.ts');

api.settings.init()
  .then(()=>{
    var url = new URL(window.location.href);
    var id = url.searchParams.get("mal-sync-background");
    con.log(id);
    var episodeList = [];

    var page = new syncPage(window.location.href);
    page.cdn = function(){
      api.request.sendMessage({name: "iframeDone", id: 'retry', epList: []});
    }
    page.handlePage = async function(){
      con.log('handlePage');
      var state: any;
      if(this.page.isSyncPage(this.url)){
        state = {
          identifier: this.page.sync.getIdentifier(this.url)
        };
        //@ts-ignore
        this.offset = await api.storage.get(this.page.name+'/'+state.identifier+'/Offset');
      }else{
        state = {
          identifier: this.page.overview!.getIdentifier(this.url)
        };
        //@ts-ignore
        this.offset = await api.storage.get(this.page.name+'/'+state.identifier+'/Offset');
        con.log('Overview', state);
      }

      if (typeof(this.page.overview) != "undefined" && typeof(this.page.overview.list) != "undefined"){
        var elementUrl = this.page.overview.list.elementUrl;
        var tempEpisodeList = j.$.map( this.getEpList(), function( val, i ) {if(typeof(val) != "undefined"){return elementUrl(val)}return '-';});

        var changed = false;
        for (var key in tempEpisodeList) {
          var tempEpisode = tempEpisodeList[key];
          if(tempEpisode != '-' && (episodeList[key] == '-' || typeof episodeList[key] == 'undefined')){
            episodeList[key] = tempEpisode.replace(/\?mal-sync-background=[^\/]+/, '');
            changed = true;
          }
        }
        //episodeList = episodeList.map(x => Object.assign(x, tempEpisodeList.find(y => y.id == x.id && x == '-')));

        con.log("Episode List", episodeList);
        if(typeof this.page.overview.list.paginationNext !== 'undefined' && changed){
          con.log('Pagination next');
          var This = this;
          try{
            if(this.page.overview.list.paginationNext(true)){
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
