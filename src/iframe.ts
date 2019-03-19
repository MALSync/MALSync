import {getPlayerTime} from "./utils/player";

var tempPlayer:any = undefined;

getPlayerTime(function(item, player){
  chrome.runtime.sendMessage({name: "videoTime", item: item});
  tempPlayer = player;
});

// @ts-ignore
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
  if(msg.action == 'videoTimeSet'){
    con.log('[Iframe] Set Time', msg);
    if(typeof tempPlayer === 'undefined'){
      con.error('[Iframe] No player Found');
      return;
    }
    if(typeof msg.time !== 'undefined'){
      tempPlayer.play();
      tempPlayer.currentTime = msg.time;
      return;
    }
    if(typeof msg.timeAdd !== 'undefined'){
      tempPlayer.play();
      tempPlayer.currentTime = tempPlayer.currentTime + msg.timeAdd;
      return;
    }
  }
});
