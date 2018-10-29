import {xhrI, xhrResponseI, sendMessageI, responseMessageI} from "./api/messageInterface";
import {scheduleUpdate} from "./utils/scheduler";
import {checkInit, checkContinue} from "./updateCheck/backgroundIframe";

api.request.sendMessage = function(message: sendMessageI){
  return new Promise((resolve, reject) => {
    messageHandler(message, null, function(response: responseMessageI) {
      resolve(response);
    });
  });
}

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
    case "iframeDone": {
      checkContinue(message);
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

checkInit();

function webRequestListener(){
  chrome.permissions.contains({
    permissions: ['webRequest']
  }, function(result) {
    if (result) {
      con.log('webRequest permissions found');
      chrome.webRequest.onHeadersReceived.addListener(function (details) {
        con.log('test', details);
        if(details.initiator!.indexOf(chrome.runtime.id) !== -1){
          con.log('Remove x-frame-options');
          for (var i = 0; i < details.responseHeaders!.length; ++i) {
            if (details.responseHeaders![i].name.toLowerCase() == 'x-frame-options') {
              details.responseHeaders!.splice(i, 1);
              return {
                responseHeaders: details.responseHeaders
              };
            }
          }
        }
      }, {
        urls: ["*://*/*mal-sync-background=*"]
      }, ["blocking", "responseHeaders"]);
    } else {
      con.log('No webRequest permissions');
    }
  });
}

webRequestListener();
chrome.permissions.onAdded.addListener(function(){
  webRequestListener();
});

/*chrome.permissions.request({
    permissions: ["webRequest", "webRequestBlocking"],
    origins: chrome.runtime.getManifest().optional_permissions!.filter((permission) => {return (permission != 'webRequest' && permission != 'webRequestBlocking')})
  }, function(granted) {
    con.log('optional_permissions', granted);
  });*/
