import {xhrI, xhrResponseI, sendMessageI, responseMessageI} from "./api/messageInterface";
import {scheduleUpdate} from "./utils/scheduler";

/*api.request.sendMessage = function(message: sendMessageI){
  return new Promise((resolve, reject) => {
    messageHandler(message, null, function(response: responseMessageI) {
      resolve(response);
    });
  });
}*/

chrome.runtime.onInstalled.addListener(function(details){
    if(details.reason == "install"){
    }else if(details.reason == "update"){
    }
    chrome.alarms.clearAll();
});

chrome.runtime.onMessage.addListener((message: sendMessageI, sender, sendResponse)  => {
  return messageHandler(message, sender, sendResponse)
});

function messageHandler(message: sendMessageI, sender, sendResponse){
  switch (message.name) {
    case "xhr": {
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function(){
        if (xhr.readyState == 4) {
          console.log(xhr);
          var responseObj: xhrResponseI = {
            finalUrl: xhr.responseURL,
            responseText: xhr.responseText,
            status: xhr.status
          }
          sendResponse(responseObj);
        }
      }
      if(typeof message.url === 'object'){
        xhr.open(message.method, message.url.url, true);
        for (var key in message.url.headers) {
          xhr.setRequestHeader(key, message.url.headers[key]);
        }
        xhr.send(message.url.data);
      }else{
        xhr.open(message.method, message.url, true);
        xhr.send();
      }
      return true;
    }
  }
  return undefined;
}

chrome.alarms.get("schedule", function(a) {
  if(typeof a === 'undefined'){
    con.log('Create schedule Alarm');
    chrome.alarms.create("schedule", {
      periodInMinutes: 60 * 24
    });
    scheduleUpdate();
  }else{
    con.log(a);
  }
});

chrome.alarms.onAlarm.addListener(function(alarm) {
  if (alarm.name === "schedule") {
    scheduleUpdate();
  }
});
