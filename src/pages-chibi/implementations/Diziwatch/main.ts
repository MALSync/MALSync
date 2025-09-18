import { PageInterface } from '../../pageInterface';

declare const chrome: any | undefined;
declare const browser: any | undefined;
declare const api: any | undefined;

const EPISODE_TITLE_SELECTOR = '#router-view .col-span-7 h2.text-sm.text-white';
const OVERVIEW_TITLE_SELECTOR = '#router-view h2.text-sm.text-white';
const OVERVIEW_CONTAINER_SELECTOR = '#router-view .boxitm';
const PLAYER_CONTAINER_SELECTOR = '#player-video';
const EPISODE_LINK_SELECTOR = '#router-view .sm\\:col-span-3 a[href*="/bolum-"]';
const NEXT_EP_SELECTOR = '.col-span-7 a[href*="/bolum-"]';
const VIDEO_BRIDGE_FLAG = '__malsync_diziwatch_bridge';

const STORAGE_CURRENT_KEY = 'pubplus_currentTime';
const STORAGE_DURATION_KEY = 'pubplus_duration';

// iframe selector for pichive player
const IFRAME_SELECTOR = 'iframe[src*="pichive.online"]';

type BridgeState = {
  lastMsgType?: string;
  lastSent?: { current: number; duration: number; paused: boolean };
  lastSampleCurrent?: number;
  lastSampleDuration?: number;
  lastSampleTs?: number;
  playerDetected?: boolean;
  iframeSrc?: string;
  messageListenerAdded?: boolean;
  // Player state for iframe integration
  currentTime?: number;
  duration?: number;
  paused?: boolean;
  isIframeReady?: boolean;
};

function parseFiniteNumber(value: unknown): number | undefined {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const parsed = Number.parseFloat(trimmed);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function forwardTime(state: BridgeState, current: number, duration: number, paused: boolean) {
  if (!Number.isFinite(current) || !Number.isFinite(duration) || duration <= 0) return;

  const last = state.lastSent;
  if (
    last &&
    Math.abs(last.current - current) < 0.05 &&
    Math.abs(last.duration - duration) < 0.05 &&
    last.paused === paused
  ) {
    return;
  }

  state.lastSent = { current, duration, paused };
  state.lastSampleCurrent = current;
  state.lastSampleDuration = duration;
  state.lastSampleTs = Date.now();
  sendVideoTime({ current, duration, paused });
}

function startStoragePolling(state: BridgeState) {
  if (typeof window === 'undefined') return;

  const poll = () => {
    try {
      if (!window.localStorage) return;
    } catch (error) {
      return;
    }

    let currentRaw: string | null = null;
    let durationRaw: string | null = null;
    try {
      currentRaw = window.localStorage.getItem(STORAGE_CURRENT_KEY);
      durationRaw = window.localStorage.getItem(STORAGE_DURATION_KEY);
    } catch (error) {
      return;
    }

    const current = parseFiniteNumber(currentRaw);
    const duration = parseFiniteNumber(durationRaw);
    if (current === undefined || duration === undefined || duration <= 0) return;

    const prevCurrent = state.lastSampleCurrent;
    const delta = typeof prevCurrent === 'number' ? current - prevCurrent : undefined;
    const hasMeaningfulProgress = typeof delta === 'number' && Math.abs(delta) > 0.05;

    if (hasMeaningfulProgress) {
      state.lastMsgType =
        state.lastMsgType === 'paused' || state.lastMsgType === 'error'
          ? 'playing'
          : state.lastMsgType;
    }

    const paused =
      state.lastMsgType === 'paused' ||
      state.lastMsgType === 'error' ||
      (typeof delta === 'number' && Math.abs(delta) < 0.05);

    forwardTime(state, current, duration, paused);
  };

  poll();
  const intervalId = window.setInterval(poll, 1000);

  // Player detection and enhanced polling
  const playerCheckInterval = window.setInterval(() => {
    const playerContainer = document.querySelector('#player-video');
    if (playerContainer && playerContainer.querySelector(IFRAME_SELECTOR)) {
      const iframe = playerContainer.querySelector(IFRAME_SELECTOR) as HTMLIFrameElement;
      const iframeSrc = iframe?.src;

      if (!state.playerDetected) {
        state.playerDetected = true;
        state.iframeSrc = iframeSrc;
        state.isIframeReady = false;
        console.log('[MALSync][Diziwatch] Player detected with src:', iframeSrc);

        // Add message listener when player is detected
        if (!state.messageListenerAdded) {
          addPlayerMessageListener(state);
          state.messageListenerAdded = true;
        }
      } else if (state.iframeSrc !== iframeSrc) {
        // If iframe src changed, update it and re-add listener
        state.iframeSrc = iframeSrc;
        state.isIframeReady = false;
        console.log('[MALSync][Diziwatch] Player iframe src changed to:', iframeSrc);

        if (!state.messageListenerAdded) {
          addPlayerMessageListener(state);
          state.messageListenerAdded = true;
        }
      }
    } else if (state.playerDetected) {
      // Player removed, clear state
      state.playerDetected = false;
      state.iframeSrc = undefined;
      state.isIframeReady = false;
      state.lastMsgType = undefined;
      state.lastSent = undefined;
      console.log('[MALSync][Diziwatch] Player removed');
    }
  }, 3000);
}

function addPlayerMessageListener(state: BridgeState) {
  // Listen for player events through postMessage
  const messageHandler = (event: MessageEvent) => {
    try {
      if (event.data && typeof event.data === 'object') {
        // Handle DiziWatch specific player messages
        if (event.data.msgVer === '2' || event.data.msgVer === 2) {
          const time = parseFiniteNumber(event.data?.timeInfo?.time);
          const duration = parseFiniteNumber(event.data?.timeInfo?.duration);

          if (time !== undefined && duration !== undefined && duration > 0) {
            const paused = event.data.msgType === 'paused' || event.data.msgType === 'error';
            forwardTime(state, time, duration, paused);

            // Update player state
            state.currentTime = time;
            state.duration = duration;
            state.paused = paused;
            state.isIframeReady = true;

            // Send message to parent window for iframe integration
            window.parent.postMessage(
              {
                type: 'MALSyncPlayerTime',
                current: time,
                duration,
                paused,
              },
              '*',
            );

            // Update last message type
            if (typeof event.data.msgType === 'string') {
              state.lastMsgType = event.data.msgType;
            }
          }
        }

        // Handle generic player messages
        if (event.data.currentTime !== undefined && event.data.duration !== undefined) {
          const current = parseFiniteNumber(event.data.currentTime);
          const duration = parseFiniteNumber(event.data.duration);
          if (current !== undefined && duration !== undefined && duration > 0) {
            const paused = event.data.paused === true;
            forwardTime(state, current, duration, paused);

            // Update player state
            state.currentTime = current;
            state.duration = duration;
            state.paused = paused;
            state.isIframeReady = true;

            // Send message to parent window for iframe integration
            window.parent.postMessage(
              {
                type: 'MALSyncPlayerTime',
                current,
                duration,
                paused,
              },
              '*',
            );
          }
        }

        // Handle alternative time formats
        if (event.data.time !== undefined && event.data.totalTime !== undefined) {
          const current = parseFiniteNumber(event.data.time);
          const duration = parseFiniteNumber(event.data.totalTime);
          if (current !== undefined && duration !== undefined && duration > 0) {
            const paused = event.data.paused === true;
            forwardTime(state, current, duration, paused);

            // Update player state
            state.currentTime = current;
            state.duration = duration;
            state.paused = paused;
            state.isIframeReady = true;

            // Send message to parent window for iframe integration
            window.parent.postMessage(
              {
                type: 'MALSyncPlayerTime',
                current,
                duration,
                paused,
              },
              '*',
            );
          }
        }
      }
    } catch (e) {
      console.debug('[MALSync][Diziwatch] Error processing player message', e);
    }
  };

  window.addEventListener('message', messageHandler);
  console.log('[MALSync][Diziwatch] Added player message listener');
}

function sendVideoTime(payload: { current: number; duration: number; paused: boolean }) {
  try {
    if (typeof chrome !== 'undefined' && chrome?.runtime?.sendMessage) {
      chrome.runtime.sendMessage({ name: 'videoTime', item: payload });
      return;
    }
    if (typeof browser !== 'undefined' && browser?.runtime?.sendMessage) {
      browser.runtime.sendMessage({ name: 'videoTime', item: payload });
      return;
    }
    if (typeof api !== 'undefined' && api?.request?.sendMessage) {
      api.request.sendMessage({ name: 'videoTime', item: payload });
    }
  } catch (error) {
    console.error('[MALSync][Diziwatch] Failed to forward videoTime', error);
  }
}

function setupPichiveBridge() {
  if (typeof window === 'undefined') return;
  const globalScope = window as typeof window & { [VIDEO_BRIDGE_FLAG]?: boolean };
  if (globalScope[VIDEO_BRIDGE_FLAG]) return;
  globalScope[VIDEO_BRIDGE_FLAG] = true;

  const state: BridgeState = {};
  startStoragePolling(state);

  // Enhanced player detection for iframe-based players
  const detectPlayer = () => {
    const playerContainer = document.querySelector('#player-video');
    if (playerContainer) {
      // Check for iframe player
      const iframe = playerContainer.querySelector(IFRAME_SELECTOR) as HTMLIFrameElement;
      if (iframe && iframe.src) {
        state.playerDetected = true;
        state.iframeSrc = iframe.src;
        state.isIframeReady = false;
        console.log('[MALSync][Diziwatch] Player detected on load with src:', iframe.src);

        // Add message listener
        if (!state.messageListenerAdded) {
          addPlayerMessageListener(state);
          state.messageListenerAdded = true;
        }
      }
    }
  };

  // Run player detection after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', detectPlayer);
  } else {
    detectPlayer();
  }

  // Also listen for player messages at the global level
  window.addEventListener('message', event => {
    const data = event.data;
    if (!data || typeof data !== 'object') return;

    // Handle DiziWatch specific messages
    const versionCheck = data.msgVer === '2' || data.msgVer === 2;
    if (versionCheck) {
      if (typeof data.msgType === 'string') {
        state.lastMsgType = data.msgType;
      }

      const time = parseFiniteNumber(data?.timeInfo?.time);
      const duration = parseFiniteNumber(data?.timeInfo?.duration);

      if (time !== undefined && duration !== undefined && duration > 0) {
        const paused = data.msgType === 'paused' || data.msgType === 'error';
        forwardTime(state, time, duration, paused);

        // Update player state
        state.currentTime = time;
        state.duration = duration;
        state.paused = paused;
        state.isIframeReady = true;

        if (data.msgType === 'watched') {
          forwardTime(state, duration, duration, true);
        }
      }
    }
  });
}

export const Diziwatch: PageInterface = {
  name: 'Diziwatch',
  type: 'anime',
  domain: 'https://diziwatch.tv',
  languages: ['Turkish'],
  urls: {
    match: ['*://*.diziwatch.tv/*'],
  },
  sync: {
    isSyncPage($c) {
      return $c.url().regex('dizi/[^/]+/sezon-\\d+/bolum-\\d+', 0).boolean().run();
    },
    getTitle($c) {
      return $c
        .querySelector(EPISODE_TITLE_SELECTOR)
        .ifNotReturn()
        .text()
        .trim()
        .replaceRegex('\\s+\\d+\\.\\s*Sezon.*$', '')
        .replaceRegex('\\s+Season\\s*\\d+.*$', '')
        .run();
    },
    getIdentifier($c) {
      return $c.url().regex('dizi/([^/?#]+)', 1).run();
    },
    getOverviewUrl($c) {
      return $c.url().regex('(https://diziwatch\\.tv/dizi/[^/?#]+)', 1).run();
    },
    getEpisode($c) {
      return $c.url().regex('bolum-(\\d+)', 1).number().run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector(NEXT_EP_SELECTOR)
        .ifNotReturn()
        .getAttribute('href')
        .urlAbsolute()
        .run();
    },
    uiInjection($c) {
      return $c.querySelector(PLAYER_CONTAINER_SELECTOR).ifNotReturn().uiBefore().run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and(
          $c.url().regex('dizi/[^/]+(?:/sezon-\\d+)?/?$', 0).boolean().run(),
          $c.url().contains('/bolum-').not().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c
        .querySelector(OVERVIEW_TITLE_SELECTOR)
        .ifNotReturn()
        .text()
        .trim()
        .replaceRegex('\\s+\\d+\\.\\s*Sezon.*$', '')
        .replaceRegex('\\s+Season\\s*\\d+.*$', '')
        .run();
    },
    getIdentifier($c) {
      return $c.url().regex('dizi/([^/?#]+)', 1).run();
    },
    getImage($c) {
      return $c
        .querySelector('#router-view img.aspect-\\[30/40\\], #router-view img.lazyload')
        .ifNotReturn()
        .getAttribute('src')
        .urlAbsolute()
        .run();
    },
    uiInjection($c) {
      return $c.querySelector(OVERVIEW_CONTAINER_SELECTOR).ifNotReturn().uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll(EPISODE_LINK_SELECTOR).run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return $c.this('list.elementUrl').this('sync.getEpisode').run();
    },
  },
  lifecycle: {
    setup($c) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call, global-require, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-member-access
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      setupPichiveBridge();
      return $c.domReady().trigger().detectURLChanges($c.trigger().run()).run();
    },
  },
};
