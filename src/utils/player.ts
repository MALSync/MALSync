var inter;

export function getPlayerTime(callback){
  clearInterval(inter);
  inter = setInterval(function(){
    var players = document.getElementsByTagName('video');
    for (var i = 0; i < players.length; i++) {
      var player:any = players[i];
      var duration = player.duration;
      var current = player.currentTime;
      var paused = player.paused;

      if(duration && duration > 60){
        var item = {
          current,
          duration,
          paused
        }
        con.info(window.location.href, item);
        callback(item, player);
        playerExtras(item, player);
        break;
      }

    }
  }, 1000);
}

var videoIdentifier = '';

function playerExtras(item, player){
  var tempVideoIdentifier = player.currentSrc
  if(item.current > 1 && videoIdentifier !== tempVideoIdentifier){
    videoIdentifier = tempVideoIdentifier;
    con.info('New player detected');

    setFullscreen(player);
  }
}

async function setFullscreen(player){
  if(!await api.settings.getAsync('autofull')) return;
  //@ts-ignore
  if((window.fullScreen) || (window.innerWidth == screen.width && window.innerHeight == screen.height)) {
    con.info('Browser already in fullscreen');
  }else{
    var playerEl = player;

    var ids = [
      'player',
      'vstr',
      'vplayer',
      'mgvideo',
      'myVideo',
      'b-video-wrapper',
      'vilos',
    ];

    var classes = [
      'AT-player',
      'plyr',
      'AkiraPlayer',
      'video-js',
    ];

    var found = false;

    for (var i in ids) {
      var playerTemp = document.getElementById(ids[i]);
      if(playerTemp !== null){
        found = true;
        playerEl = playerTemp;
        break;
      }
    }

    for (var i in classes) {
      var classTemp = document.getElementsByClassName(classes[i]).item(0);
      if(classTemp !== null){
        found = true;
        playerEl = classTemp;
        break;
      }
    }

    if(!found){
      var vHeight = playerEl.offsetHeight;
      var vWidth = playerEl.offsetWidth;

      while(playerEl.parentElement && vHeight === playerEl.parentElement.offsetHeight && vWidth === playerEl.parentElement.offsetWidth) {
        playerEl = playerEl.parentElement;
        found = true;
      }
    }

    if(!found && !player.getAttribute('controls')){
      if (document.addEventListener) {
        document.addEventListener('fullscreenchange', exitHandler, false);
        document.addEventListener('mozfullscreenchange', exitHandler, false);
        document.addEventListener('MSFullscreenChange', exitHandler, false);
        document.addEventListener('webkitfullscreenchange', exitHandler, false);
      }

      function exitHandler() {
        //@ts-ignore
        if (document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement !== null) {
          player.removeAttribute("controls","controls");
        }
      }

      player.setAttribute("controls","controls");
    }

    if (playerEl.requestFullscreen) {
      playerEl.requestFullscreen();
    } else if (playerEl.msRequestFullscreen) {
      playerEl.msRequestFullscreen();
    } else if (playerEl.mozRequestFullScreen) {
      playerEl.mozRequestFullScreen();
    } else if (playerEl.webkitRequestFullscreen) {
      playerEl.webkitRequestFullscreen();
    }
  }
}

//https://stackoverflow.com/questions/5203407/how-to-detect-if-multiple-keys-are-pressed-at-once-using-javascript
var init = false;

var currCallback;

const shortcutOptions = [
  'introSkipFwd',
  'introSkipBwd',
  'nextEpShort',
  'correctionShort',
];

export function shortcutListener(callback) {
  currCallback = callback;

  if(!init) initShortcuts();

  function initShortcuts() {
    init = true;
    var keyMap = {};
    onkeydown = onkeyup = function(e){
      e = e || event;
      var key = e.which || e.keyCode;
      //@ts-ignore
      keyMap[key] = e.type == 'keydown';

      for (var i = 0; i < shortcutOptions.length; i++) {
        const option = shortcutOptions[i];
        if(checkShortcut(option)){
          //@ts-ignore
          if(/textarea|input|select/i.test(e.target.nodeName) || e.target.shadowRoot) {
            con.info('Input field. Shortcut suppressed.');
          }else{
            return shortcutDetected(option);
          }
        }
      }

      function shortcutDetected(option) {
        keyMap = {};
        callback({shortcut: option});
        return false;
      }
    };

    window.addEventListener("focus", function(event){
        keyMap = {};
    }, false);

    function checkShortcut(option) {
      var keys = api.settings.get(option);
      if(!keys.length) return false;
      var shortcutTrue = true;
      keys.forEach(function(sKey) {
        if(!keyMap[sKey]) {
          shortcutTrue = false;
        }
      });
      return shortcutTrue;
    }
  }

}
