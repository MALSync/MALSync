import { pageInterface } from '../pageInterface';
import { ScriptProxy } from '../../utils/scriptProxy';

interface BstationMeta {
  title?: string;
  episode?: number;
  seriesId?: string | number;
  episodeId?: string | number;
}

function getLang(url: string) {
  return utils.urlPart(url, 3) || 'en';
}

function getSeriesId(url: string) {
  return String(utils.urlPart(url, 5));
}

function selectText(selectors: string[]): string {
  for (let i = 0; i < selectors.length; i += 1) {
    const sel = selectors[i];
    const el = j.$(sel).first();
    if (el && el.length) {
      const txt = el.text().trim();
      if (txt) return txt;
    }
  }
  return '';
}

const proxy = new ScriptProxy('Bstation');

let proxyData: BstationMeta | null = null;

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Bstation: pageInterface = {
  name: 'Bstation',
  domain: 'https://www.bilibili.tv',
  languages: ['Indonesian', 'English', 'Thai', 'Vietnamese', 'Malay', 'Arabic'],
  type: 'anime',
  isSyncPage(url) {
    return utils.urlPart(url, 4) === 'play';
  },
  isOverviewPage(url) {
    return utils.urlPart(url, 4) === 'media';
  },
  sync: {
    getTitle(_url) {
      if (proxyData && proxyData.title) return proxyData.title;
      // Targeted DOM selector fallback (no tab-title parsing)
      const t = selectText([
        '[data-e2e="media-title"]',
        '.media-title',
        '.media__title',
        '.ogv-title',
        '.title-h1',
      ]);
      return t || '';
    },
    getIdentifier(_url) {
      if (proxyData && proxyData.seriesId) return String(proxyData.seriesId);
      return getSeriesId(window.location.href);
    },
    getOverviewUrl(_url) {
      const lang = getLang(window.location.href);
      const id = (proxyData && proxyData.seriesId) || getSeriesId(window.location.href);
      return `${String(Bstation.domain)}/${lang}/media/${id}`;
    },
    getEpisode(_url) {
      if (proxyData && proxyData.episode) return Number(proxyData.episode);
      // Target DOM selector for highlighted episode index
      const epTxt = selectText([
        '[data-e2e="episode-item"].active [data-e2e="episode-index"]',
        '.ep-section .list .item.active .index',
        '.episode-list .active .index',
      ]);
      const m = epTxt.match(/\d+/);
      return m ? Number(m[0]) : 0;
    },
    getImage() {
      return j.$('meta[property="og:image"]').attr('content') || undefined;
    },
  },
  overview: {
    getTitle(_url) {
      if (proxyData && proxyData.title) return proxyData.title;
      const t = selectText([
        '[data-e2e="media-title"]',
        '.media-title',
        '.media__title',
        '.ogv-title',
        '.title-h1',
      ]);
      return t || '';
    },
    getIdentifier(_url) {
      return getSeriesId(window.location.href);
    },
    uiSelector(selector) {
      const anchor = j.$('h1, .media, .player').first();
      if (anchor && anchor.length) {
        anchor.after(j.html(selector));
      } else {
        j.$('body').prepend(j.html(selector));
      }
    },
    getImage() {
      return j.$('meta[property="og:image"]').attr('content') || undefined;
    },
  },
  init(page) {
    function handle() {
      page.reset();
      if (Bstation.isSyncPage(window.location.href)) {
        utils.waitUntilTrue(
          () => {
            proxy
              .getData()
              .then(d => {
                proxyData = d as BstationMeta;
              })
              .catch(() => {
                proxyData = null;
              });
            return (
              !!getSeriesId(window.location.href) &&
              (!!(proxyData && (proxyData.title || proxyData.episode)) ||
                !!selectText([
                  '[data-e2e="media-title"]',
                  '.media-title',
                  '.media__title',
                  '.ogv-title',
                  '.title-h1',
                ]))
            );
          },
          () => page.handlePage(),
          500,
        );
      } else if (Bstation.isOverviewPage!(window.location.href)) {
        utils.waitUntilTrue(
          () => {
            proxy
              .getData()
              .then(d => {
                proxyData = d as BstationMeta;
              })
              .catch(() => {
                proxyData = null;
              });
            return (
              !!(proxyData && proxyData.title) ||
              !!selectText([
                '[data-e2e="media-title"]',
                '.media-title',
                '.media__title',
                '.ogv-title',
                '.title-h1',
              ])
            );
          },
          () => page.handlePage(),
          500,
        );
      }
    }

    proxy
      .injectScript()
      .catch(() => undefined)
      .finally(() => {
        j.$(document).ready(() => handle());
      });
    utils.urlChangeDetect(() => handle());
  },
};
