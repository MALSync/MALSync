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
          if(xhr.status === 429){
            con.error('RATE LIMIT');
            setTimeout(() => {
              messageHandler(message, sender, sendResponse);
            }, 10000)
            return;
          }
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
        getCookies(message.url.url, sender, xhr, () => {
          //@ts-ignore
          xhr.send(message.url.data);
        });
      }else{
        xhr.open(message.method, message.url, true);
        getCookies(message.url, sender, xhr, function(){
          xhr.send();
        });

      }
      return true;
    }
    case "iframeDone": {
      checkContinue(message);
    }
    case "videoTime": {
      //@ts-ignore
      chrome.tabs.sendMessage(sender.tab.id, {action: "videoTime", item: message.item, sender: sender});
    }
    case "videoTimeSet": {
      //@ts-ignore
      chrome.tabs.sendMessage(message.sender.tab.id, {action: "videoTimeSet", time: message.time, timeAdd: message.timeAdd}, {frameId: message.sender.frameId});
    }
  }
  return undefined;
}

function getCookies(url, sender, xhr, callback = function(){}){
  chrome.permissions.contains({
    permissions: ['cookies']
  }, function(result) {
    //@ts-ignore
    if(!result || typeof browser === 'undefined' || !browser){
      callback();
      return;
    }

    var cookieId = '';
    if(typeof sender != 'undefined' && sender && typeof sender.tab != 'undefined' && typeof sender.tab.cookieStoreId != 'undefined'){
      cookieId = sender.tab.cookieStoreId;
    }

    if(typeof sender != 'undefined' && sender && typeof sender.envType != 'undefined' && sender.envType === 'addon_child'){
      chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        //@ts-ignore
        if(tabs[0] && typeof tabs[0].cookieStoreId != 'undefined'){
          //@ts-ignore
          cookieId = tabs[0].cookieStoreId;
        }
        t(cookieId);
      });
    }else{
      t(cookieId);
    }

    function t(cookieId){
      if(cookieId !== '') {
        //@ts-ignore
        browser.cookies.getAll({storeId: cookieId, url: url}).then(function(cookies){
          con.log('Cookie Store', cookieId, cookies);
          var cookiesText = '';
          for (var key in cookies) {
            var cookie = cookies[key];
            cookiesText += cookie.name+'='+cookie.value+'; ';
          }
          if(cookiesText !== ''){
            xhr.setRequestHeader('CookieTemp', cookiesText);
            xhr.withCredentials = "true";
          }

          callback();
        });
        return;
      }

      callback();
    }
  });
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

chrome.alarms.get("updateCheck", async function(a) {
  if(typeof a === 'undefined'){
    var updateCheckTime = await api.storage.get("updateCheckTime");
    if(typeof updateCheckTime != 'undefined' && updateCheckTime && updateCheckTime != '0'){
      var updateCheck = await api.storage.get("updateCheck");
      if(typeof updateCheck === 'undefined' || !parseInt(updateCheck) || parseInt(updateCheck) < Date.now()){
        updateCheck = Date.now() + 1000;
      }
      con.log('Create updateCheck Alarm', updateCheckTime+'m', updateCheck);
      chrome.alarms.create("updateCheck", {
        periodInMinutes: parseInt(updateCheckTime),
        when: parseInt(updateCheck)
      });
    }
  }else{
    con.log(a);
  }
});

chrome.alarms.onAlarm.addListener(function(alarm) {
  if(typeof alarm.periodInMinutes != 'undefined'){
    api.storage.set( alarm.name, Date.now() + ( alarm.periodInMinutes * 1000 * 60) );
  }
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
    }
  });

  chrome.permissions.contains({
    permissions: ['webRequest', 'cookies']
  }, function(result) {
    if (result) {
      con.log('Cookie permissions found');
      chrome.webRequest.onBeforeSendHeaders.addListener(
          function (details) {
            var tempCookies = '';
            details.requestHeaders!.forEach(function(requestHeader){
              if (requestHeader.name === "CookieTemp") {
                tempCookies = requestHeader!.value!;
              }
            });

            if(tempCookies !== ''){
              con.log('Replace Cookies', tempCookies);
              details.requestHeaders!.forEach(function(requestHeader){
                if (requestHeader.name.toLowerCase() === "cookie") {
                  requestHeader.value = tempCookies;
                }
              });
            }
            return {
              requestHeaders: details.requestHeaders
            };

          }, {
              urls: [ "*://myanimelist.net/*" ]
          }, ['blocking', 'requestHeaders']
      );

    } else {
      con.log('No webRequest permissions');
    }
  });
}

webRequestListener();

chrome.notifications.onClicked.addListener(function(notificationId) {
  chrome.tabs.create({url: notificationId});
});

try{
  chrome.permissions.onAdded.addListener(function(){
    webRequestListener();
  });
}catch(e){
  con.info('Permission on change', e);
}
