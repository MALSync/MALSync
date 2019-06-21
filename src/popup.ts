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

  })


