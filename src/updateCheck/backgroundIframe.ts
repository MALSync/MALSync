/*TODO: Manga*/

export function checkInit(){
  chrome.alarms.get("updateCheck", function(a) {
    if(typeof a === 'undefined'){
      con.log('Create updateCheck Alarm');
      chrome.alarms.create("updateCheck", {
        periodInMinutes: 60 * 24
      });
      startCheck();
    }else{
      con.log(a);
    }
  });

  chrome.alarms.onAlarm.addListener(function(alarm) {
    if (alarm.name === "updateCheck") {
      startCheck()
    }
  });
}

function startCheck(){
  con.log('startCheck');
  chrome.alarms.getAll(function(alarms){
    utils.getUserList(1, 'anime', null, null, async function(list){
      con.log('list', list)
      for (var i = 0; i < list.length; i++) {
        con.log('el', list[i])
        await updateElement(list[i]);
      }
      removeIframes();
    });
  })
}

async function updateElement(el){
  return new Promise((resolve, reject) => {
    con.log(utils.getUrlFromTags(el['tags']));
    var streamUrl = utils.getUrlFromTags(el['tags']);
    if(typeof streamUrl != 'undefined'){
      //Remove other iframes
      removeIframes();
      //Create iframe
      var ifrm = document.createElement("iframe");
      streamUrl += (streamUrl.split('?')[1] ? '&':'?') + 'mal-sync-background=true';
      ifrm.setAttribute("src", streamUrl);
      document.body.appendChild(ifrm);
      setTimeout(function(){
        resolve();
      },60000)
    }else{
      resolve();
    }
  });
}

function removeIframes(){
  var iframes = document.querySelectorAll('iframe');
  for (var i = 0; i < iframes.length; i++) {
      iframes[i].parentNode!.removeChild(iframes[i]);
  }
}
