import {syncPage} from "./pages/syncPage";

con.log('updateCheck.ts');

api.settings.init()
  .then(()=>{
    var url = new URL(window.location.href);
    var id = url.searchParams.get("mal-sync-background");
    con.log(id);

    var page = new syncPage(window.location.href);
    page.handlePage = async function(){
      if (typeof(this.page.overview) != "undefined" && typeof(this.page.overview.list) != "undefined"){
        var elementUrl = this.page.overview.list.elementUrl;
        var episodeList = j.$.map( this.getEpList(), function( val, i ) {if(typeof(val) != "undefined"){return elementUrl(val)}return '-';});
        con.log("Episode List", episodeList);
        api.request.sendMessage({name: "iframeDone", id: id, epList: episodeList});
      }
    }
    page.init();
  });
