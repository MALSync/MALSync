/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
// cspell:ignore autofull vstr vplayer mgvideo vilos Akira plyr flashm

const logger: any = con.m('Player');

let inter: number | null = null;
let videoIdentifier = '';

const exitHandler = (player: HTMLVideoElement) => {
  if (
    (document as any).webkitIsFullScreen ||
    (document as any).mozFullScreen ||
    (document as any).msFullscreenElement !== null
  ) {
    player.removeAttribute('controls');
  }
};

async function setFullscreen(player: HTMLVideoElement) {
  if (!(await (api as any).settings.getAsync('autofull'))) return;
  if (
    (window as any).fullScreen ||
    (window.innerWidth === window.screen.width && window.innerHeight === window.screen.height)
  ) {
    (con as any).info('Browser already in fullscreen');
  } else {
    let playerEl: HTMLElement = player;

    const ids = ['player', 'vstr', 'vplayer', 'mgvideo', 'myVideo', 'b-video-wrapper', 'vilos'];

    const classes = ['AT-player', 'plyr', 'AkiraPlayer', 'video-js'];

    let found = false;

    for (let i = 0; i < ids.length; i++) {
      const playerTemp = document.getElementById(ids[i]);
      if (playerTemp !== null) {
        found = true;
        playerEl = playerTemp;
        break;
      }
    }

    if (!found) {
      for (let i = 0; i < classes.length; i++) {
        const classTemp = document.getElementsByClassName(classes[i]).item(0);
        if (classTemp !== null) {
          found = true;
          playerEl = classTemp as HTMLElement;
          break;
        }
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
        document.addEventListener('fullscreenchange', () => exitHandler(player), false);
        document.addEventListener('mozfullscreenchange', () => exitHandler(player), false);
        document.addEventListener('MSFullscreenChange', () => exitHandler(player), false);
        document.addEventListener('webkitfullscreenchange', () => exitHandler(player), false);
      }

      player.setAttribute('controls', 'controls');
    }

    if (playerEl.requestFullscreen) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      playerEl.requestFullscreen();
    } else if ((playerEl as any).msRequestFullscreen) {
      (playerEl as any).msRequestFullscreen();
    } else if ((playerEl as any).mozRequestFullScreen) {
      (playerEl as any).mozRequestFullScreen();
    } else if ((playerEl as any).webkitRequestFullscreen) {
      (playerEl as any).webkitRequestFullscreen();
    }
  }
}

const playerExtras = (item: { current: number }, player: HTMLVideoElement) => {
  const tempVideoIdentifier = player.currentSrc;
  if (item.current > 1 && videoIdentifier !== tempVideoIdentifier) {
    videoIdentifier = tempVideoIdentifier;
    logger.log('New player detected', player.currentSrc);

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    setFullscreen(player);
  }
};

export function getPlayerTime(callback: (item: any, player: HTMLVideoElement) => void) {
  if (inter) clearInterval(inter);
  inter = window.setInterval(() => {
    if (!(api as any).settings.get('autoPlayerTracking')) return;
    const players = document.getElementsByTagName('video');
    for (let i = 0; i < players.length; i++) {
      const player = players[i];
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

export function fullscreenNotification(text: string) {
  if (!(api as any).settings.get('floatButtonStealth')) {
    const fullscreenElement =
      document.fullscreenElement ||
      // @ts-expect-error - vendor specific property
      document.mozFullScreenElement ||
      // @ts-expect-error - vendor specific property
      document.webkitFullscreenElement ||
      (document as any).msFullscreenElement;

    if (fullscreenElement) {
      // eslint-disable-next-line jquery-unsafe-malsync/no-xss-jquery
      const flashmHtml = (j as any).html(`
        <div style="
          all: initial;
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          color: white;
          display: none;
          z-index: 20000;
        ">
          <div style="
            background: rgba(50, 50, 50, 0.6);
            color: white;
            padding: 10px 15px 10px;
            margin-left: auto;
            margin-right: auto;
            max-width: 60%;
            display: table;
            font-family: Helvetica,Arial,sans-serif;
            text-align: center;
          ">${text}</div>
        </div>
        `);
      const flashmEl: any = (j as any).$(flashmHtml);

      // eslint-disable-next-line jquery-unsafe-malsync/no-xss-jquery
      (j as any).$(fullscreenElement).append(flashmEl);

      flashmEl
        .slideDown(400)
        .delay(2000)
        .slideUp(400, () => {
          flashmEl.remove();
        });
    }
  }
}

/* eslint-disable */
// https://stackoverflow.com/questions/5203407/how-to-detect-if-multiple-keys-are-pressed-at-once-using-javascript
let init = false;

let currCallback;

const shortcutOptions = [
  //
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

    document.addEventListener('keydown', keyEvent);
    document.addEventListener('keyup', keyEvent);

    function keyEvent(e) {

      e = e || event;
      const key = e.which || e.keyCode;
      keyMap[key] = e.type === 'keydown';

      for (let i = 0; i < shortcutOptions.length; i++) {
        const option = shortcutOptions[i];
        if (checkShortcut(option)) {
          if (
            e.target instanceof Node &&
            (/textarea|input|select/i.test(e.target.nodeName) || (e.target instanceof Element && e.target.shadowRoot))
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
      function () {
        keyMap = {};
      },
      false,
    );

    function checkShortcut(option) {
      const keys = api.settings.get(option);
      if (!keys.length) return false;
      let shortcutTrue = true;
      keys.forEach(function (sKey) {
        if (!keyMap[sKey]) {
          shortcutTrue = false;
        }
      });
      if (shortcutTrue && Object.values(keyMap).filter(c => c).length !== keys.length) shortcutTrue = false;
      return shortcutTrue;
    }
  }
}

