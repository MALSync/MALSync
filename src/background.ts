import {xhrI, xhrResponseI, sendMessageI, responseMessageI} from "./api/messageInterface";

chrome.runtime.onMessage.addListener((message: sendMessageI, sender, sendResponse)  => {
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
});
