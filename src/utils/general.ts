declare let browser: any;

export function urlPart(url: string, part: number) {
  if (!url) return '';

  const urlParts = url.split('/');

  if (!urlParts[part]) return '';

  return urlParts[part].replace(/[#?].*/, '');
}

export function urlStrip(url: string) {
  return url.replace(/[#?].*/, '');
}

export function urlParam(url, name) {
  const results = new RegExp(`[?&]${name}=([^&#]*)`).exec(url);
  if (results === null) {
    return null;
  }
  return decodeURI(results[1]) || 0;
}

export function getBaseText(element) {
  let text = element.text();
  element.children().each(function() {
    // @ts-ignore
    text = text.replace(j.$(this).text(), '');
  });
  return text;
}

/**
 * Generates a (hex) string ID for randomisation/verification.
 */
export function generateUniqueID(arraySize = 10): string {
  const array = new Uint32Array(arraySize);
  window.crypto.getRandomValues(array);
  return Array.from(array, value => value.toString(16)).join('');
}

export function favicon(domain) {
  const res = domain.match(/^(https?:\/\/)?[^/]+/);

  if (res) domain = res[0];

  return `https://favicon.malsync.moe/?domain=${domain}`;
}

export function watching(type: 'anime' | 'manga') {
  if (type === 'manga') return 'Reading';
  return 'Watching';
}

export function planTo(type: 'anime' | 'manga') {
  if (type === 'manga') return 'Plan to Read';
  return 'Plan to Watch';
}

export function episode(type: 'anime' | 'manga') {
  if (type === 'manga') return api.storage.lang('UI_Chapter');
  return api.storage.lang('UI_Episode');
}

export const syncRegex = /(^settings\/.*|^updateCheckTime$|^tempVersion$|^local:\/\/|^list-tagSettings$)/;

export enum status {
  // eslint-disable-next-line no-shadow
  watching = 1,
  completed = 2,
  onhold = 3,
  dropped = 4,
  planToWatch = 6,
}

export function getselect(data, name) {
  let temp = data.split(`name="${name}"`)[1].split('</select>')[0];
  if (temp.indexOf('selected="selected"') > -1) {
    temp = temp.split('<option');
    for (let i = 0; i < temp.length; ++i) {
      if (temp[i].indexOf('selected="selected"') > -1) {
        return temp[i].split('value="')[1].split('"')[0];
      }
    }
  }
  return '';
}

export function absoluteLink(url, domain) {
  if (typeof url === 'undefined') {
    return url;
  }
  if (!url.startsWith('http')) {
    if (url.charAt(0) !== '/') url = `/${url}`;
    url = domain + url;
  }
  return url;
}

export function parseHtml(text) {
  const parser = new DOMParser();
  const dom = parser.parseFromString(`<!doctype html><body>${text}`, 'text/html');
  return dom.body.textContent;
}

export function urlChangeDetect(callback) {
  let currentPage = window.location.href;
  return setInterval(function() {
    if (currentPage !== window.location.href) {
      currentPage = window.location.href;
      callback();
    }
  }, 100);
}

export function fullUrlChangeDetect(callback, strip = false) {
  let currentPage = '';
  const intervalId = setInterval(function() {
    const url = strip ? urlStrip(window.location.href) : window.location.href;
    if (currentPage !== url) {
      currentPage = url;
      callback();
    }
  }, 100);

  return Number(intervalId);
}

export function changeDetect(callback, func) {
  let currentPage = func();
  const intervalId = setInterval(function() {
    const temp = func();
    if (typeof temp !== 'undefined' && currentPage !== temp) {
      currentPage = func();
      callback();
    }
  }, 500);

  return Number(intervalId);
}

export function waitUntilTrue(condition: Function, callback: Function, interval = 100) {
  const intervalId = setInterval(function() {
    if (condition()) {
      clearInterval(intervalId);
      callback();
    }
  }, interval);

  return intervalId;
}

export function getAsyncWaitUntilTrue(condition: Function, interval = 100) {
  let intervalId;
  let rejectThis;
  const reset = () => {
    clearTimeout(intervalId);
    if (rejectThis) rejectThis('AsyncWait stopped');
  };

  return {
    asyncWaitUntilTrue: () => {
      reset();
      return new Promise<void>((resolve, reject) => {
        rejectThis = reject;
        intervalId = waitUntilTrue(condition, () => resolve(), interval);
      });
    },
    reset,
  };
}

const doubleId = Math.random();
export function checkDoubleExecution() {
  if ($('.mal-sync-double-detect').length) {
    $('.mal-sync-double-detect').each(function(index) {
      if ($(this).text() !== doubleId.toString()) {
        alert('Double execution detected! Please run MAL-Sync once only.');
      }
    });
  }
  $('body').after(j.html(`<div class="mal-sync-double-detect" style="display: none;">${doubleId.toString()}</div>`));
}

export function getUrlFromTags(tags: string) {
  if (/malSync::[\d\D]+::/.test(tags)) {
    return atobURL(tags.split('malSync::')[1].split('::')[0]);
  }
  if (/last::[\d\D]+::/.test(tags)) {
    return atobURL(tags.split('last::')[1].split('::')[0]);
  }
  return undefined;

  function atobURL(encoded) {
    try {
      return atob(encoded);
    } catch (e) {
      return encoded;
    }
  }
}

export function setUrlInTags(url: string, tags: string) {
  if (url === '') {
    tags = tags.replace(/,?(malSync|last)::[^ \n]+?::/, '');
    return tags;
  }
  if (!api.settings.get('malTags')) return tags;
  const addition = `malSync::${btoa(url)}::`;
  if (/(last|malSync)::[\d\D]+::/.test(tags)) {
    tags = tags.replace(/(last|malSync)::[^^]*?::/, addition);
  } else {
    tags = `${tags},${addition}`;
  }
  return tags;
}

export async function setResumeWaching(url: string, ep: number, type, id) {
  return api.storage.set(`resume/${type}/${id}`, { url, ep });
}

export async function getResumeWaching(type, id): Promise<{ url?: string; ep?: number } | void> {
  if (!api.settings.get('malResume')) return;

  /* eslint-disable-next-line consistent-return */
  return api.storage.get(`resume/${type}/${id}`);
}

export async function setContinueWaching(url: string, ep: number, type, id) {
  return api.storage.set(`continue/${type}/${id}`, { url, ep });
}

export async function getContinueWaching(type, id): Promise<{ url?: string; ep?: number } | void> {
  if (!api.settings.get('malContinue')) return;

  /* eslint-disable-next-line consistent-return */
  return api.storage.get(`continue/${type}/${id}`);
}

export async function setEntrySettings(type, id, options, tags = '') {
  const tempOptions = {};
  if (options) {
    for (const key in options) {
      switch (key) {
        case 'u':
        case 'p':
          tempOptions[key] = options[key];
          break;
        default:
      }
    }

    if (api.settings.get('malTags')) {
      // TAG mode
      tags = setUrlInTags(JSON.stringify(tempOptions), tags);
    } else {
      // No TAG mode
      await api.storage.set(`tagSettings/${type}/${id}`, JSON.stringify(tempOptions));
    }
  }

  if (!Object.values(tempOptions).find(el => Boolean(el))) {
    tags = setUrlInTags('', tags);
    if (!api.settings.get('malTags')) {
      await api.storage.remove(`tagSettings/${type}/${id}`);
    }
  }

  return tags;
}

export async function getEntrySettings(type, id, tags = '') {
  const tempOptions: any = {
    u: null, // url
    c: null, // Continue Url
    r: null, // Resume Url
    p: '', // Progress Mode
  };

  if (api.settings.get('malTags')) {
    // TAG mode
    const tagString = getUrlFromTags(tags);
    if (tagString) {
      if (tagString[0] === '{') {
        try {
          const temp = JSON.parse(tagString);
          for (const key in tempOptions) {
            if (temp[key]) tempOptions[key] = temp[key];
          }
        } catch (e) {
          con.error(e);
        }
      } else {
        tempOptions.u = tagString;
      }
    }
  } else {
    // No TAG mode
    let temp: any = await api.storage.get(`tagSettings/${type}/${id}`);

    if (temp) {
      temp = JSON.parse(temp);

      for (const key in tempOptions) {
        if (temp[key]) tempOptions[key] = temp[key];
      }
    }
  }

  const continueUrlObj = await getContinueWaching(type, id);
  if (continueUrlObj) tempOptions.c = continueUrlObj;
  const resumeUrlObj = await getResumeWaching(type, id);
  if (resumeUrlObj) tempOptions.r = resumeUrlObj;

  if (!api.settings.get('usedPage')) tempOptions.u = null;

  return tempOptions;
}

export function handleMalImages(url) {
  if (url.indexOf('questionmark') !== -1) return api.storage.assetUrl('questionmark.gif');
  return url;
}

export function getTooltip(text, style = '', direction = 'top') {
  const rNumber = Math.floor(Math.random() * 1000 + 1);
  return `<div id="tt${rNumber}" class="icon material-icons" style="font-size:16px; line-height: 0; color: #7f7f7f; padding-bottom: 20px; padding-left: 3px; ${style}">contact_support</div>\
  <div class="mdl-tooltip mdl-tooltip--${direction} mdl-tooltip--large" for="tt${rNumber}">${text}</div>`;
}

export function timeDiffToText(delta) {
  let text = '';

  delta /= 1000;

  const diffYears = Math.floor(delta / 31536000);
  delta -= diffYears * 31536000;
  if (diffYears) {
    text += `${diffYears}y `;
  }

  const diffDays = Math.floor(delta / 86400);
  delta -= diffDays * 86400;
  if (diffDays) {
    text += `${diffDays}d `;
  }

  const diffHours = Math.floor(delta / 3600) % 24;
  delta -= diffHours * 3600;
  if (diffHours && diffDays < 2) {
    text += `${diffHours}h `;
  }

  const diffMinutes = Math.floor(delta / 60) % 60;
  delta -= diffMinutes * 60;
  if (diffMinutes && !diffDays && diffHours < 3) {
    text += `${diffMinutes}min `;
  }

  return text;
}

export function canHideTabs() {
  if (typeof browser !== 'undefined' && typeof browser.tabs.hide !== 'undefined') {
    return true;
  }
  return false;
}

// eslint-disable-next-line no-shadow
export function statusTag(status, type, id) {
  const info = {
    anime: {
      1: {
        class: 'watching',
        text: 'CW',
        title: 'Watching',
      },
      2: {
        class: 'completed',
        text: 'CMPL',
        title: 'Completed',
      },
      3: {
        class: 'on-hold',
        text: ' HOLD',
        title: 'On-Hold',
      },
      4: {
        class: 'dropped',
        text: 'DROP',
        title: 'Dropped',
      },
      6: {
        class: 'plantowatch',
        text: 'PTW',
        title: 'Plan to Watch',
      },
    },
    manga: {
      1: {
        class: 'reading',
        text: 'CR',
        title: 'Reading',
      },
      2: {
        class: 'completed',
        text: 'CMPL',
        title: 'Completed',
      },
      3: {
        class: 'on-hold',
        text: ' HOLD',
        title: 'On-Hold',
      },
      4: {
        class: 'dropped',
        text: 'DROP',
        title: 'Dropped',
      },
      6: {
        class: 'plantoread',
        text: 'PTR',
        title: 'Plan to Read',
      },
    },
  };

  $.each([1, 2, 3, 4, 6], function(i, el) {
    info.anime[info.anime[el].title] = info.anime[el];
    info.manga[info.manga[el].title] = info.manga[el];
  });

  if (status) {
    const tempInfo = info[type][status];
    return ` <a href="https://myanimelist.net/ownlist/${type}/${id}/edit?hideLayout=1" title="${tempInfo.title}" class="Lightbox_AddEdit button_edit ${tempInfo.class}">${tempInfo.text}</a>`;
  }
  return false;
}

// eslint-disable-next-line consistent-return
export function notifications(url: string, title: string, message: string, iconUrl = '') {
  const messageObj = {
    type: 'basic',
    title,
    message,
    iconUrl,
  };

  con.log('Notification', url, messageObj);

  api.storage.get('notificationHistory').then(history => {
    if (history === undefined) {
      history = [];
    }

    if (typeof history !== 'object') return;

    if (history.length >= 10) {
      history.shift();
    }
    history.push({
      url,
      title: messageObj.title,
      message: messageObj.message,
      iconUrl: messageObj.iconUrl,
      timestamp: Date.now(),
    });
    api.storage.set('notificationHistory', history);
  });

  try {
    return chrome.notifications.create(url, messageObj);
  } catch (e) {
    con.error(e);
  }
}

export async function timeCache(key, dataFunction, ttl) {
  const value = await api.storage.get(key);
  if (typeof value === 'object' && new Date().getTime() < value.timestamp) {
    return value.data;
  }
  const result = await dataFunction();
  return api.storage.set(key, { data: result, timestamp: new Date().getTime() + ttl }).then(() => {
    return result;
  });
}

// flashm
export function flashm(
  text,
  options?: {
    error?: boolean;
    type?: string;
    permanent?: boolean;
    hoverInfo?: boolean;
    position?: 'top' | 'bottom';
    minimized?: boolean;
  },
) {
  if (!j.$('#flash-div-top').length) {
    initflashm();
  }
  con.log('[Flash] Message:', text);

  let colorF = '#323232';
  if (typeof options !== 'undefined' && typeof options.error !== 'undefined' && options.error) {
    colorF = '#3e0808';
  }

  let flashdiv = '#flash-div-bottom';
  if (typeof options !== 'undefined' && typeof options.position !== 'undefined' && options.position) {
    flashdiv = `#flash-div-${options.position}`;
  }

  let messClass = 'flash';
  if (typeof options !== 'undefined' && typeof options.type !== 'undefined' && options.type) {
    const tempClass = `type-${options.type}`;
    j.$(`${flashdiv} .${tempClass}, #flashinfo-div .${tempClass}`)
      .removeClass(tempClass)
      .fadeOut({
        duration: 1000,
        queue: false,
        complete() {
          j.$(this).remove();
        },
      });

    messClass += ` ${tempClass}`;
  }

  let mess = `<div class="${messClass}" style="display:none;">\
        <div style="display:table; pointer-events: all; padding: 14px 24px 14px 24px; margin: 0 auto; margin-top: 5px; max-width: 60%; -webkit-border-radius: 20px;-moz-border-radius: 20px;border-radius: 2px;color: white;background:${colorF}; ">\
          ${text}\
        </div>\
      </div>`;

  let flashmEl;

  if (typeof options !== 'undefined' && typeof options.hoverInfo !== 'undefined' && options.hoverInfo) {
    messClass += ' flashinfo';
    mess = `<div class="${messClass}" style="display:none; max-height: 5000px; overflow: hidden;"><div style="display:table; pointer-events: all; margin: 0 auto; margin-top: -2px; max-width: 60%; -webkit-border-radius: 20px;-moz-border-radius: 20px;border-radius: 2px;color: white;background:${colorF}; position: relative;"><div style="max-height: 60vh; overflow-y: auto; padding: 14px 24px 14px 24px;">${text}</div></div></div>`;
    j.$('#flashinfo-div').addClass('hover');
    // eslint-disable-next-line jquery-unsafe-malsync/no-xss-jquery
    flashmEl = j.$(j.html(mess)).appendTo('#flashinfo-div');
    if (typeof options !== 'undefined' && typeof options.minimized !== 'undefined' && options.minimized)
      flashmEl.css('max-height', '8px');
  } else {
    // eslint-disable-next-line jquery-unsafe-malsync/no-xss-jquery
    flashmEl = j.$(j.html(mess)).appendTo(flashdiv);
  }

  if (typeof options !== 'undefined' && typeof options.permanent !== 'undefined' && options.permanent) {
    flashmEl.slideDown(800);
  } else if (typeof options !== 'undefined' && typeof options.hoverInfo !== 'undefined' && options.hoverInfo) {
    flashmEl
      .slideDown(800)
      .delay(4000)
      .queue(function() {
        j.$('#flashinfo-div').removeClass('hover');
        flashmEl.css('max-height', '8px');
      });
  } else {
    flashmEl
      .slideDown(800)
      .delay(4000)
      .slideUp(800, () => {
        // @ts-ignore
        j.$(this).remove();
      });
  }
  return flashmEl;
}

export async function flashConfirm(
  message,
  type,
  yesCall = () => {
    /* Placeholder */
  },
  cancelCall = () => {
    /* Placeholder */
  },
  yesNo = false,
): Promise<boolean> {
  return new Promise(function(resolve, reject) {
    let yesText = api.storage.lang('Ok');
    let noText = api.storage.lang('Cancel');
    if (yesNo) {
      yesText = api.storage.lang('Yes');
      noText = api.storage.lang('No');
    }
    message = `<div style="text-align: center;">${message}</div><div style="display: flex; justify-content: space-around;"><button class="Yes" style="background-color: transparent; border: none; color: rgb(255,64,129);margin-top: 10px; cursor:pointer;">${yesText}</button><button class="Cancel" style="background-color: transparent; border: none; color: rgb(255,64,129);margin-top: 10px; cursor:pointer;">${noText}</button></div>`;
    const flasmessage = flashm(message, {
      permanent: true,
      position: 'top',
      type,
    });
    flasmessage.find('.Yes').click(function(evt) {
      resolve(true);
      j.$(evt.target)
        .parentsUntil('.flash')
        .fadeOut(300, function() {
          // @ts-ignore
          j.$(this).remove();
        });
      yesCall();
    });
    flasmessage.find('.Cancel').click(function(evt) {
      resolve(false);
      j.$(evt.target)
        .parentsUntil('.flash')
        .fadeOut(300, function() {
          // @ts-ignore
          j.$(this).remove();
        });
      cancelCall();
    });
  });
}

function initflashm() {
  api.storage.addStyle(
    `.flashinfo{
                    transition: max-height 2s, opacity 2s 2s;
                 }
                 .mini-stealth .flashinfo{
                    opacity: 0;
                 }
                  #flashinfo-div.hover.mini-stealth .flashinfo.type-update{
                    opacity: 0.7;
                 }
                 #flashinfo-div.hover .flashinfo{
                    opacity: 1;
                 }
                 .flashinfo:hover{
                    max-height:5000px !important;
                    z-index: 2147483647;
                    opacity: 1;
                    transition: max-height 2s;
                 }
                 .flashinfo .synopsis{
                    transition: max-height 2s, max-width 2s ease 2s;
                 }
                 .flashinfo:hover .synopsis{
                    max-height:9999px !important;
                    max-width: 500px !important;
                    transition: max-height 2s;
                 }
                 #flashinfo-div{
                  z-index: 2;
                  transition: 2s;
                 }
                 #flashinfo-div:hover, #flashinfo-div.hover{
                  z-index: 2147483647;
                 }
                 #flashinfo-div.player-error {
                   z-index: 2147483647;
                 }
                 #flashinfo-div.player-error .type-update{
                  overflow: visible !important;
                  opacity: 1 !important;
                 }
                 #flashinfo-div.player-error .player-error{
                  display: block !important
                 }

                 #flash-div-top, #flash-div-bottom, #flashinfo-div{
                    font-family: "Helvetica","Arial",sans-serif;
                    color: white;
                    font-size: 14px;
                    font-weight: 400;
                    line-height: 17px;
                 }
                 #flash-div-top h2, #flash-div-bottom h2, #flashinfo-div h2{
                    font-family: "Helvetica","Arial",sans-serif;
                    color: white;
                    font-size: 14px;
                    font-weight: 700;
                    line-height: 17px;
                    padding: 0;
                    margin: 0;
                 }
                 #flash-div-top a, #flash-div-bottom a, #flashinfo-div a{
                    color: #DF6300;
                 }`,
  );

  let extraClass = '';
  if (api.settings.get('floatButtonStealth')) extraClass = 'mini-stealth';

  j.$('body').after(
    j.html(
      `<div id="flash-div-top" style="text-align: center;pointer-events: none;position: fixed;top:-5px;width:100%;z-index: 2147483647;left: 0;"></div>\
        <div id="flash-div-bottom" style="text-align: center;pointer-events: none;position: fixed;bottom:0px;width:100%;z-index: 2147483647;left: 0;"><div id="flash" style="display:none;  background-color: red;padding: 20px; margin: 0 auto;max-width: 60%;          -webkit-border-radius: 20px;-moz-border-radius: 20px;border-radius: 20px;background:rgba(227,0,0,0.6);"></div></div>\
        <div id="flashinfo-div" class="${extraClass}" style="text-align: center;pointer-events: none;position: fixed;bottom:0px;width:100%;left: 0;">`,
    ),
  );
}

let lazyloaded = false;
let lazyimages: any[] = [];

export function lazyload(doc, scrollElement = '.mdl-layout__content') {
  /* lazyload.js (c) Lorenzo Giuliani
   * MIT License (http://www.opensource.org/licenses/mit-license.html)
   *
   * expects a list of:
   * `<img src="blank.gif" data-src="my_image.png" width="600" height="400" class="lazy">`
   */
  // eslint-disable-next-line
  function loadImage(el, fn) {
    if (!j.$(el).is(':visible')) return false;
    if (j.$(el).hasClass('lazyBack')) {
      j.$(el)
        .css('background-image', `url(${el.getAttribute('data-src')})`)
        .removeClass('lazyBack');
    } else {
      const img = new Image();
      const src = el.getAttribute('data-src');
      img.onload = function() {
        if (el.parent) el.parent.replaceChild(img, el);
        else el.src = src;
        // eslint-disable-next-line
        fn ? fn() : null;
      };
      img.src = src;
    }
  }

  for (let i = 0; i < lazyimages.length; i++) {
    $(lazyimages[i]).addClass('init');
  }

  lazyimages = [];
  const query = doc.find('img.lazy.init, .lazyBack.init');
  const processScroll = function() {
    for (let i = 0; i < lazyimages.length; i++) {
      if (utils.elementInViewport(lazyimages[i], 600)) {
        // eslint-disable-next-line
        loadImage(lazyimages[i], function() {
          lazyimages.splice(i, i);
        });
      }
      if (!$(lazyimages[i]).length) {
        lazyimages.splice(i, i);
      }
    }
  };
  // Array.prototype.slice.call is not callable under our lovely IE8
  for (let i = 0; i < query.length; i++) {
    lazyimages.push(query[i]);
    $(query[i]).removeClass('init');
  }

  processScroll();

  if (!lazyloaded) {
    lazyloaded = true;
    doc.find(scrollElement).scroll(function() {
      processScroll();
    });
  }
}

export function elementInViewport(el, horizontalOffset = 0) {
  const rect = el.getBoundingClientRect();

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    // @ts-ignore
    rect.top - horizontalOffset <= (window.innerHeight || document.documentElement.clientHeight)
  );
}

export function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function pageUrl(page: 'mal' | 'anilist' | 'kitsu' | 'simkl', type: 'anime' | 'manga', id: string | number) {
  switch (page) {
    case 'mal':
      return `https://myanimelist.net/${type}/${id}`;
    case 'anilist':
      return `https://anilist.co/${type}/${id}`;
    case 'kitsu':
      return `https://kitsu.io/${type}/${id}`;
    case 'simkl':
      return `https://simkl.com/${type}/${id}`;
    default:
      throw `${page} not a valid page`;
  }
}

export function returnYYYYMMDD(numFromToday = 0) {
  const d = new Date();
  d.setDate(d.getDate() + numFromToday);
  const month = d.getMonth() < 9 ? `0${d.getMonth() + 1}` : d.getMonth() + 1;
  const day = d.getDate() < 10 ? `0${d.getDate()}` : d.getDate();
  return `${d.getFullYear()}-${month}-${day}`;
}
