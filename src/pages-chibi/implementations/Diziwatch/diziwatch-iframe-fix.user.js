// ==UserScript==
// @name         Diziwatch Iframe Player Fix for MALSync
// @namespace    https://malsync.moe/
// @version      1.1
// @description  Fix iframe player detection for Diziwatch in MALSync
// @match        *://*.diziwatch.tv/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  // iframe selector for pichive player
  const IFRAME_SELECTOR = 'iframe[src*="pichive.online"]';
  const PLAYER_CONTAINER_SELECTOR = '#player-video';
  const VIDEO_BRIDGE_FLAG = '__malsync_diziwatch_bridge';

  // State management
  let bridgeState = {
    lastMsgType: null,
    lastSent: null,
    lastSampleCurrent: null,
    lastSampleDuration: null,
    lastSampleTs: null,
    playerDetected: false,
    iframeSrc: null,
    messageListenerAdded: false,
    currentTime: 0,
    duration: 0,
    paused: true,
    isIframeReady: false
  };

  // Utility functions
  function parseFiniteNumber(value) {
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

  function forwardTime(current, duration, paused) {
    if (!Number.isFinite(current) || !Number.isFinite(duration) || duration <= 0) return;

    const last = bridgeState.lastSent;
    if (
      last &&
      Math.abs(last.current - current) < 0.05 &&
      Math.abs(last.duration - duration) < 0.05 &&
      last.paused === paused
    ) {
      return;
    }

    bridgeState.lastSent = { current, duration, paused };
    bridgeState.lastSampleCurrent = current;
    bridgeState.lastSampleDuration = duration;
    bridgeState.lastSampleTs = Date.now();
    
    // Send message to parent window for MALSync integration
    window.parent.postMessage({
      type: 'MALSyncPlayerTime',
      current: current,
      duration: duration,
      paused: paused
    }, '*');
  }

  // Player message listener
  function addPlayerMessageListener() {
    if (bridgeState.messageListenerAdded) return;
    bridgeState.messageListenerAdded = true;

    const messageHandler = function(event) {
      try {
        const data = event.data;
        if (!data || typeof data !== 'object') return;

        // Handle DiziWatch specific player messages
        if (data.msgVer === '2' || data.msgVer === 2) {
          const time = parseFiniteNumber(data?.timeInfo?.time);
          const duration = parseFiniteNumber(data?.timeInfo?.duration);

          if (time !== undefined && duration !== undefined && duration > 0) {
            const paused = data.msgType === 'paused' || data.msgType === 'error';
            forwardTime(time, duration, paused);

            // Update player state
            bridgeState.currentTime = time;
            bridgeState.duration = duration;
            bridgeState.paused = paused;
            bridgeState.isIframeReady = true;

            // Update last message type
            if (typeof data.msgType === 'string') {
              bridgeState.lastMsgType = data.msgType;
            }
          }
        }

        // Handle generic player messages
        if (data.currentTime !== undefined && data.duration !== undefined) {
          const current = parseFiniteNumber(data.currentTime);
          const duration = parseFiniteNumber(data.duration);
          if (current !== undefined && duration !== undefined && duration > 0) {
            const paused = data.paused === true;
            forwardTime(current, duration, paused);

            // Update player state
            bridgeState.currentTime = current;
            bridgeState.duration = duration;
            bridgeState.paused = paused;
            bridgeState.isIframeReady = true;
          }
        }

        // Handle alternative time formats
        if (data.time !== undefined && data.totalTime !== undefined) {
          const current = parseFiniteNumber(data.time);
          const duration = parseFiniteNumber(data.totalTime);
          if (current !== undefined && duration !== undefined && duration > 0) {
            const paused = data.paused === true;
            forwardTime(current, duration, paused);

            // Update player state
            bridgeState.currentTime = current;
            bridgeState.duration = duration;
            bridgeState.paused = paused;
            bridgeState.isIframeReady = true;
          }
        }
      } catch (e) {
        console.debug('[MALSync][Diziwatch] Error processing player message', e);
      }
    };

    window.addEventListener('message', messageHandler);
    console.log('[MALSync][Diziwatch] Added player message listener');
  }

  // Enhanced player detection for iframe-based players
  function setupPichiveBridge() {
    if (typeof window === 'undefined') return;
    const globalScope = window;
    if (globalScope[VIDEO_BRIDGE_FLAG]) return;
    globalScope[VIDEO_BRIDGE_FLAG] = true;

    // Player detection and enhanced polling
    const playerCheckInterval = setInterval(() => {
      const playerContainer = document.querySelector(PLAYER_CONTAINER_SELECTOR);
      if (playerContainer && playerContainer.querySelector(IFRAME_SELECTOR)) {
        const iframe = playerContainer.querySelector(IFRAME_SELECTOR);
        const iframeSrc = iframe?.src;

        if (!bridgeState.playerDetected) {
          bridgeState.playerDetected = true;
          bridgeState.iframeSrc = iframeSrc;
          bridgeState.isIframeReady = false;
          console.log('[MALSync][Diziwatch] Player detected with src:', iframeSrc);

          // Add message listener when player is detected
          if (!bridgeState.messageListenerAdded) {
            addPlayerMessageListener();
            bridgeState.messageListenerAdded = true;
          }
        } else if (bridgeState.iframeSrc !== iframeSrc) {
          // If iframe src changed, update it and re-add listener
          bridgeState.iframeSrc = iframeSrc;
          bridgeState.isIframeReady = false;
          console.log('[MALSync][Diziwatch] Player iframe src changed to:', iframeSrc);

          if (!bridgeState.messageListenerAdded) {
            addPlayerMessageListener();
            bridgeState.messageListenerAdded = true;
          }
        }
      } else if (bridgeState.playerDetected) {
        // Player removed, clear state
        bridgeState.playerDetected = false;
        bridgeState.iframeSrc = undefined;
        bridgeState.isIframeReady = false;
        bridgeState.lastMsgType = undefined;
        bridgeState.lastSent = undefined;
        console.log('[MALSync][Diziwatch] Player removed');
      }
    }, 3000);

    // Also listen for player messages at the global level
    window.addEventListener('message', function(event) {
      const data = event.data;
      if (!data || typeof data !== 'object') return;

      // Handle DiziWatch specific messages
      const versionCheck = data.msgVer === '2' || data.msgVer === 2;
      if (versionCheck) {
        if (typeof data.msgType === 'string') {
          bridgeState.lastMsgType = data.msgType;
        }

        const time = parseFiniteNumber(data?.timeInfo?.time);
        const duration = parseFiniteNumber(data?.timeInfo?.duration);

        if (time !== undefined && duration !== undefined && duration > 0) {
          const paused = data.msgType === 'paused' || data.msgType === 'error';
          forwardTime(time, duration, paused);

          // Update player state
          bridgeState.currentTime = time;
          bridgeState.duration = duration;
          bridgeState.paused = paused;
          bridgeState.isIframeReady = true;

          if (data.msgType === 'watched') {
            forwardTime(duration, duration, true);
          }
        }
      }
    });
  }

  // Initialize the bridge when the page is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupPichiveBridge);
  } else {
    setupPichiveBridge();
  }

  console.log('[MALSync][Diziwatch] Iframe player fix loaded');
})();
