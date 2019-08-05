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

    };
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
