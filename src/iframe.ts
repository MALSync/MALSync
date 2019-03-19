import {getPlayerTime} from "./utils/player";

getPlayerTime(function(item){
  chrome.runtime.sendMessage({name: "videoTime", item: item});
});

// @ts-ignore
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
  if(msg.action == 'videoTimeSet'){
    con.log('[Iframe] Set Time', msg);
  }
});
