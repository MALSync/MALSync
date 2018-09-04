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
    //TEMP
    minimalObj.fill('https://myanimelist.net/anime/19815/No_Game_No_Life');
    //TEMP
  })
