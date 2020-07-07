let inter;

const logger = con.m('Player');

export function getPlayerTime(callback) {
  clearInterval(inter);
  inter = setInterval(function() {
    const players = document.getElementsByTagName('video');
    for (let i = 0; i < players.length; i++) {
      const player: any = players[i];
      const { duration } = player;
      const current = player.currentTime;
      const { paused } = player;

      if (duration && duration > 60) {
        const item = {
          current,
          duration,
          paused,
        };
        logger.debug(window.location.href, item);
        callback(item, player);
        playerExtras(item, player);
        break;
      }
    }
  }, 1000);
}

let videoIdentifier = '';

function playerExtras(item, player) {
  const tempVideoIdentifier = player.currentSrc;
  if (item.current > 1 && videoIdentifier !== tempVideoIdentifier) {
    videoIdentifier = tempVideoIdentifier;
    logger.log('New player detected', player.currentSrc);

    setFullscreen(player);
  }
}

async function setFullscreen(player) {
  if (!(await api.settings.getAsync('autofull'))) return;
  if (window.fullScreen || (window.innerWidth === window.screen.width && window.innerHeight === window.screen.height)) {
    con.info('Browser already in fullscreen');
  } else {
    let playerEl = player;

    const ids = ['player', 'vstr', 'vplayer', 'mgvideo', 'myVideo', 'b-video-wrapper', 'vilos'];

    const classes = ['AT-player', 'plyr', 'AkiraPlayer', 'video-js'];

    let found = false;

    for (const i in ids) {
      const playerTemp = document.getElementById(ids[i]);
      if (playerTemp !== null) {
        found = true;
        playerEl = playerTemp;
        break;
      }
    }

    for (const i in classes) {
      const classTemp = document.getElementsByClassName(classes[i]).item(0);
      if (classTemp !== null) {
        found = true;
        playerEl = classTemp;
        break;
      }
    }

    if (!found) {
      const vHeight = playerEl.offsetHeight;
      const vWidth = playerEl.offsetWidth;

      while (
        playerEl.parentElement &&
        vHeight === playerEl.parentElement.offsetHeight &&
        vWidth === playerEl.parentElement.offsetWidth
      ) {
        playerEl = playerEl.parentElement;
        found = true;
      }
    }

    if (!found && !player.getAttribute('controls')) {
      if (document.addEventListener) {
        document.addEventListener('fullscreenchange', exitHandler, false);
        document.addEventListener('mozfullscreenchange', exitHandler, false);
        document.addEventListener('MSFullscreenChange', exitHandler, false);
        document.addEventListener('webkitfullscreenchange', exitHandler, false);
      }

      function exitHandler() {
        if (document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement !== null) {
          player.removeAttribute('controls', 'controls');
        }
      }

      player.setAttribute('controls', 'controls');
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

/* eslint-disable */
// https://stackoverflow.com/questions/5203407/how-to-detect-if-multiple-keys-are-pressed-at-once-using-javascript
let init = false;

let currCallback;

const shortcutOptions = [
  'introSkipFwd',
  'introSkipBwd',
  'nextEpShort',
  'correctionShort',
  'syncShort',
];

export function shortcutListener(callback) {
  currCallback = callback;

  if (!init) initShortcuts();

  function initShortcuts() {
    init = true;
    let keyMap = {};
    onkeydown = onkeyup = function(e) {
      e = e || event;
      const key = e.which || e.keyCode;
      // @ts-ignore
      keyMap[key] = e.type === 'keydown';

      for (let i = 0; i < shortcutOptions.length; i++) {
        const option = shortcutOptions[i];
        if (checkShortcut(option)) {
          // @ts-ignore
          if (
            e.target &&
            (/textarea|input|select/i.test(e.target.nodeName) ||
              e.target.shadowRoot)
          ) {
            con.info('Input field. Shortcut suppressed.');
          } else {
            shortcutDetected(option);
          }
        }
      }

      function shortcutDetected(option) {
        keyMap = {};
        callback({ shortcut: option });
        return false;
      }
    };

    window.addEventListener(
      'focus',
      function(event) {
        keyMap = {};
      },
      false,
    );

    function checkShortcut(option) {
      const keys = api.settings.get(option);
      if (!keys.length) return false;
      let shortcutTrue = true;
      keys.forEach(function(sKey) {
        if (!keyMap[sKey]) {
          shortcutTrue = false;
        }
      });
      if (
        shortcutTrue &&
        Object.values(keyMap).filter(c => c).length !== keys.length
      )
        shortcutTrue = false;
      return shortcutTrue;
    }
  }
}
