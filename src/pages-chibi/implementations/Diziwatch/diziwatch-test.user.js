// ==UserScript==
// @name         Diziwatch MALSync Inspector
// @namespace    https://malsync.moe/
// @version      0.6
// @description  Collect selectors for MALSync integration on diziwatch.tv
// @match        *://*.diziwatch.tv/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const helpers = {
    q: (sel) => document.querySelector(sel),
    qAll: (sel) => Array.from(document.querySelectorAll(sel)),
    safeText: (el) => el?.textContent?.trim() || null,
    absUrl: (href) => {
      try {
        return new URL(href, location.href).toString();
      } catch {
        return href || null;
      }
    },
    uniq: (arr) => Array.from(new Set(arr.filter(Boolean))),
  };

  function detectPageType() {
    const url = location.href;
    if (/bolum|episode/i.test(url)) return 'episode';
    if (/sezon|season/i.test(url)) return 'season';
    if (/dizi|series|show/i.test(url)) return 'series';
    return 'unknown';
  }

  function collectBasics(info) {
    info.url = location.href;
    info.title = document.title;
    info.pathname = location.pathname;
    info.pageType = detectPageType();
  }

  function collectOverview(info) {
    if (!/dizi|series|show/i.test(location.href)) return;
    const data = {};
    const titleEl = helpers.q('h1, h1 span, .series-title, .text-3xl, .font-bold.text-white');
    if (titleEl) {
      data.title = {
        selector: titleEl.className || titleEl.tagName,
        text: helpers.safeText(titleEl),
        html: titleEl.outerHTML,
      };
    }
    const poster = helpers.q('img[src*="poster"], img[src*="cover"], .lazyload');
    if (poster) {
      data.poster = {
        selector: poster.className || poster.tagName,
        src: helpers.absUrl(poster.getAttribute('src')),
        html: poster.outerHTML,
      };
    }
    const description = helpers.q('.text-gray-200.text-sm, .description, .line-clamp-4');
    if (description) {
      data.description = {
        selector: description.className,
        text: helpers.safeText(description),
        html: description.outerHTML,
      };
    }
    const genres = helpers
      .qAll('a[href*="tur"], a[href*="genre"], .bg-gray-800, .bg-gray-900')
      .filter((el) => helpers.safeText(el)?.length);
    if (genres.length) {
      data.genres = genres.map((el) => ({
        text: helpers.safeText(el),
        href: helpers.absUrl(el.getAttribute('href')),
        className: el.className,
      }));
    }
    const episodes = helpers
      .qAll('a[href*="/bolum"], a[href*="/episode"], a[href*="/sezon/"]')
      .map((link) => ({
        href: helpers.absUrl(link.getAttribute('href')),
        text: helpers.safeText(link),
        className: link.className,
      }));
    if (episodes.length) data.episodeLinks = episodes;
    info.overview = data;
  }

  function collectEpisode(info) {
    if (!/bolum|episode/i.test(location.href)) return;
    const data = {};
    const title = helpers.q('h1, .text-xl.font-semibold, .episode-title');
    if (title) {
      data.title = {
        text: helpers.safeText(title),
        className: title.className,
        html: title.outerHTML,
      };
    }
    const subtitle = helpers.q('h2, .text-sm.text-white, .text-gray-200');
    if (subtitle) {
      data.subtitle = {
        text: helpers.safeText(subtitle),
        className: subtitle.className,
        html: subtitle.outerHTML,
      };
    }
    const overviewLink = helpers.q('a[href*="/dizi/"], nav a[href*="/dizi/"]');
    if (overviewLink) {
      data.overviewLink = {
        href: helpers.absUrl(overviewLink.getAttribute('href')),
        text: helpers.safeText(overviewLink),
        className: overviewLink.className,
      };
    }
    const nextLink = helpers.q('a[rel="next"], .next a[href], a[href*="bolum"][href*="next"]');
    if (nextLink) {
      data.next = {
        href: helpers.absUrl(nextLink.getAttribute('href')),
        text: helpers.safeText(nextLink),
      };
    }
    data.breadcrumbs = helpers.qAll('nav a, .breadcrumbs a').map((a) => ({
      text: helpers.safeText(a),
      href: helpers.absUrl(a.getAttribute('href')),
    }));
    info.episode = data;
  }

  function collectPlayer(info) {
    // Simplified player collection focusing on iframe
    const iframePlayers = helpers.qAll('iframe[src*="pichive.online"]');
    if (iframePlayers.length) {
      info.player = iframePlayers.map((el, index) => ({
        index,
        tag: el.tagName.toLowerCase(),
        src: el.src || null,
        className: el.className || null,
        id: el.id || null,
      }));
    } else {
      // Fallback to video elements if no iframe found
      info.player = helpers.qAll('video, source').map((el, index) => ({
        index,
        tag: el.tagName.toLowerCase(),
        src: el.getAttribute('src') || el.currentSrc || null,
        className: el.className || null,
        id: el.id || null,
      }));
    }
  }

  function renderOverlay(info) {
    const existing = document.getElementById('malsync-diziwatch-overlay');
    if (existing) existing.remove();

    const container = document.createElement('div');
    container.id = 'malsync-diziwatch-overlay';
    container.style.cssText = [
      'position:fixed',
      'top:10px',
      'right:10px',
      'z-index:2147483647',
      'background:rgba(0,0,0,0.92)',
      'color:#fff',
      'padding:12px',
      'border-radius:6px',
      'font-family:Consolas,monospace',
      'font-size:12px',
      'max-width:420px',
      'max-height:85vh',
      'overflow:auto',
      'box-shadow:0 0 12px rgba(0,0,0,0.4)',
    ].join(';');

    const buttons = document.createElement('div');
    buttons.style.cssText = 'margin-bottom:6px;display:flex;gap:8px;justify-content:flex-end;';
    const copyBtn = document.createElement('button');
    copyBtn.textContent = 'Copy JSON';
    copyBtn.style.cssText = 'background:#26a69a;border:none;color:#fff;padding:6px 10px;border-radius:4px;cursor:pointer;';
    copyBtn.onclick = () => navigator.clipboard.writeText(JSON.stringify(info, null, 2));
    const refreshBtn = document.createElement('button');
    refreshBtn.textContent = 'Refresh';
    refreshBtn.style.cssText = 'background:#42a5f5;border:none;color:#fff;padding:6px 10px;border-radius:4px;cursor:pointer;';
    refreshBtn.onclick = () => {
      container.remove();
      setTimeout(runInspector, 100);
    };
    buttons.append(copyBtn, refreshBtn);
    container.appendChild(buttons);

    const header = document.createElement('div');
    header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;';
    header.innerHTML = `<strong>MALSync Inspector</strong><button style="background:#ff5252;border:none;color:#fff;width:22px;height:22px;border-radius:50%;cursor:pointer">✕</button>`;
    header.querySelector('button').onclick = () => container.remove();
    container.appendChild(header);

    const pre = document.createElement('pre');
    pre.textContent = JSON.stringify(info, null, 2);
    pre.style.whiteSpace = 'pre-wrap';
    container.appendChild(pre);

    document.body.appendChild(container);
  }

  function runInspector() {
    const info = {};
    collectBasics(info);
    collectOverview(info);
    collectEpisode(info);
    collectPlayer(info);
    renderOverlay(info);
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    runInspector();
  } else {
    document.addEventListener('DOMContentLoaded', runInspector);
  }

  const observer = new MutationObserver(() => {
    clearTimeout(window.__malsyncInspectorTimer);
    window.__malsyncInspectorTimer = setTimeout(runInspector, 1000);
  });
  observer.observe(document.documentElement || document.body, { childList: true, subtree: true });
})();
