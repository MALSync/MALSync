import {syncPage} from "./pages/syncPage";

con.log('updateCheck.ts');

api.settings.init()
  .then(()=>{
    var page = new syncPage(window.location.href);
    page.handlePage = async function(){
      if (typeof(this.page.overview) != "undefined" && typeof(this.page.overview.list) != "undefined"){
        var elementUrl = this.page.overview.list.elementUrl;
        con.log("Episode List", j.$.map( this.getEpList(), function( val, i ) {if(typeof(val) != "undefined"){return elementUrl(val)}return '-';}));
        api.request.sendMessage({name: "iframeDone"});
      }
    }
    page.init();
  });
