import { pageInterface } from '../pageInterface';

export const Hidive: pageInterface = {
  name: 'Hidive',
  domain: 'https://www.hidive.com',
  languages: ['English', 'Spanish', 'Portuguese', 'French', 'German', 'Arabic', 'Italian', 'Russian'],
  type: 'anime',
  isSyncPage(url) {
    if (url.split('/')[3] === 'stream') {
      return true;
    }
    return false;
  },

  sync: {
    getTitle(url) {
      return j.$('#TitleDetails').text();
    },
    getIdentifier(url) {
      return url.split('/')[4];
    },
    getOverviewUrl(url) {
      return Hidive.domain + (j.$('#TitleDetails').attr('href') || '');
    },
    getEpisode(url) {
      const temp = url.split('/')[5];
      const regex = /^\d/;
      if (regex.test(temp)) {
        return Number(temp.slice(8));
      }
      return Number(temp.slice(4));
    },
    nextEpUrl(url) {
      const nextEp = j.$('#StreamNextEpisode .episode-play').attr('data-key');
      if (!nextEp) {
        return nextEp;
      }
      if (nextEp !== url.split('/')[5]) {
        return `${Hidive.domain}/stream/${j.$('#StreamNextEpisode .episode-play').attr('data-videotitle')}/${nextEp}`;
      }
      return undefined;
    },
  },

  overview: {
    getTitle(url) {
      return j
        .$('div.text-container a')
        .text()
        .replace('Score It', '')
        .trim();
    },
    getIdentifier(url) {
      return url.split('/')[4];
    },
    uiSelector(selector) {
      j.$('div.details')
        .first()
        .after(j.html(`<div class="container"> ${selector}</div>`));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('div.episode-slider > div > div > div.cell > div:nth-child(1) > div.hitbox').filter(function() {
          if (j.$(this).find('div.na').length) return false;

          const playerUrl =
            j
              .$(this)
              .find('.player > a')
              .attr('data-playurl') || '';

          if (
            j
              .$(this)
              .find('.player > a')
              .attr('data-playurl') &&
            window.location.href.split('/')[4] === playerUrl.split('/')[4]
          )
            return true;

          return false;
        });
      },
      elementUrl(selector) {
        return selector.find('div.player > a').attr('data-playurl') || '';
      },
      elementEp(selector) {
        const temp = selector.find('div.player > a').attr('data-key');
        const regex = /^\d/;
        if (temp && regex.test(temp)) {
          return Number(temp.slice(8));
        }
        if (temp) {
          return Number(temp.slice(4));
        }
        return 0;
      },
    },
  },

  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      if (
        (page.url.split('/')[3] === 'stream' ||
          page.url.split('/')[3] === 'tv' ||
          page.url.split('/')[3] === 'movies') &&
        page.url.split('/')[4] !== undefined
      ) {
        page.handlePage();
        utils.urlChangeDetect(function() {
          con.info('Check');
          page.handlePage();
        });
      }
    });
  },
};
