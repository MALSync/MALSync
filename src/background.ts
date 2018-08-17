chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.name) {
    case "xhr": {
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function(){
        if (xhr.readyState == 4) {
          console.log(xhr);
          sendResponse(xhr.responseText);
        }
      }
      xhr.open(message.method, message.url, true);
      xhr.send();
      return true;
    }
  }
  return undefined;
});
