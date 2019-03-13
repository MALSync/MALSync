import {getPlayerTime} from "./utils/player";

getPlayerTime(function(item){
  chrome.runtime.sendMessage({name: "videoTime", item: item});
});
