import { urlPart } from '../../utils/general';
import { pageInterface } from '../pageInterface';

// const logger = con.m('Anime365', '#1b5e20');

function isNumeric(str: string) {
  return !Number.isNaN(parseInt(str));
}

function isSlug(part: string) {
  const slugArr = part.split('-');
  return isNumeric(slugArr[slugArr.length - 1]);
}

export const Anime365: pageInterface = {
  name: 'Anime365',
  languages: ['Russian'],
  domain: [
    'https://smotret-anime.org',
    'https://anime365.ru',
    'https://anime-365.ru',
    'https://smotret-anime.online',
    'https://smotret-anime.com',
    'https://smotret-anime.ru',
    'https://smotretanime.ru',
    'https://smotret-anime.app',
  ],
  type: 'anime',
  isSyncPage(url) {
    // Example: https://smotret-anime.net/catalog/horimiya-24061/1-seriya-252417/angliyskie-subtitry-3494584
    if (utils.urlPart(url, 5) !== '' && utils.urlPart(url, 3) === 'catalog') {
      return true;
    }
    return false;
  },
  isOverviewPage(url) {
    // Example: https://smotret-anime.net/catalog/uzaki-chan-wa-asobitai-21810
    if (utils.urlPart(url, 5) === '' && utils.urlPart(url, 3) === 'catalog') {
      return isSlug(urlPart(url, 4));
    }
    return false;
  },
  getImage() {
    return utils.absoluteLink(
      j.$('meta[property~="og:image"]').attr('content') ||
        j.$('.m-catalog-item__poster img').attr('src'),
      window.location.hostname,
    );
  },
  // Parsing from page could be very buggy
  overview: {
    getTitle(url) {
      return utils.getBaseText(j.$('.card-content .line-2')).trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    getMalUrl(provider) {
      const MalHref = j.$('.m-catalog-view-links a[href^="https://myanimelist.net/"]').attr('href');
      if (MalHref) {
        return MalHref;
      }
      return false;
    },
    uiSelector(selector) {
      let resSelector = '<div class="card"><div class="card-content">';
      resSelector += selector;
      resSelector += '</div></div>';
      j.$('.body-container .col:last-of-type > .card').first().after(j.html(resSelector));
    },
  },
  sync: {
    getTitle(url) {
      return j.$('.card-content .line-2 a').clone().children().remove().end().text().trim();
    },
    getIdentifier(url) {
      return Anime365.overview!.getIdentifier(url);
    },
    getOverviewUrl(url) {
      return `https://${utils.urlPart(url, 2)}/catalog/${Anime365.sync.getIdentifier(url)}`;
    },
    getEpisode(url) {
      const ep_meta = j.$('meta[property~="ya:ovs:episode"]');
      if (ep_meta.length === 0) return 1;
      const ep_str = ep_meta.attr('content');
      return parseInt(ep_str || '1');
    },
    getMalUrl(provider) {
      return Anime365.overview!.getMalUrl!(provider);
    },
    nextEpUrl(url) {
      const rightIcon = j.$('.m-select-sibling-episode .waves-effect:has(i.right)');
      if (rightIcon.length > 0)
        return utils.absoluteLink(rightIcon.attr('href'), window.location.origin);
      return undefined;
    },
    uiSelector(selector) {
      Anime365.overview!.uiSelector!(selector);
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    utils.urlChangeDetect(() => {
      utils.waitUntilTrue(
        () => {
          return j.$('.card-image').length > 0;
        },
        () => {
          j.$(() => {
            page.reset();
            page.handlePage();
          });
        },
      );
    });
    j.$(() => {
      page.handlePage();
    });
  },
};
