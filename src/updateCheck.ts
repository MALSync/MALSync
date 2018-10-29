import {syncPage} from "./pages/syncPage";

con.log('updateCheck.ts');

api.settings.init()
  .then(()=>{
    var url = new URL(window.location.href);
    var id = url.searchParams.get("mal-sync-background");

    var page = new syncPage(window.location.href);
    page.handlePage = async function(){
      if (typeof(this.page.overview) != "undefined" && typeof(this.page.overview.list) != "undefined"){
        var elementUrl = this.page.overview.list.elementUrl;
        con.log("Episode List", j.$.map( this.getEpList(), function( val, i ) {if(typeof(val) != "undefined"){return elementUrl(val)}return '-';}));
        api.request.sendMessage({name: "iframeDone", id: id});
      }
    }
    page.init();
  });
