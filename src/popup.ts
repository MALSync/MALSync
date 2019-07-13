import {minimal} from "./minimal/minimalClass";

declare var componentHandler: any;

document.getElementsByTagName('head')[0].onclick = function(e){
  try{
    componentHandler.upgradeDom();
  }catch(e){
    console.log(e);
    setTimeout(function(){
      componentHandler.upgradeDom();
    },500);
  }
}

api.settings.init()
  .then(()=>{
    var minimalObj = new minimal($('html'));

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
      // @ts-ignore
      chrome.tabs.sendMessage(tabs[0].id, {action: "TabMalUrl"}, function(response) {
        setTimeout(() => {
          if(typeof response != 'undefined'){
            minimalObj.fillBase(response);
          }else{
            minimalObj.fillBase(null);
          }
        }, 500);
      });
    });

    try{
      var mode = $('html').attr('mode');
      con.log('Mode', mode);
      if(mode === 'popup'){
        chrome.runtime.sendMessage({name: "minimalWindow"}, function(response){
          $('html').css('height', '0');
          if(!isFirefox()){
            window.close();
          }
        });
      }
    }catch(e){
      con.error(e);
    }

  })

function isFirefox(){
  if($('#Mal-Sync-Popup').css('min-height') === '600px') return true;
  return false;
}
