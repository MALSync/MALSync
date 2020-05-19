import { pageInterface } from './../pageInterface';

export const Hidive: pageInterface = {
  name: 'Hidive',
  domain: 'https://www.hidive.com',
  type: 'anime',
  isSyncPage: function(url) {
    if (url.split('/')[3] === 'stream') {
      return true;
    } else {
      return false;
    }
  },

  sync: {
    getTitle: function(url) {
      return j.$('#TitleDetails').text();
    },
    getIdentifier: function(url) {
      return url.split('/')[4];
    },
    getOverviewUrl: function(url) {
      return Hidive.domain + (j.$('#TitleDetails').attr('href') || '');
    },
    getEpisode: function(url) {
      const temp = url.split('/')[5];
      const regex = /^\d/;
      if (regex.test(temp)) {
        return Number(temp.slice(8));
      } else {
        return Number(temp.slice(4));
      }
    },
    nextEpUrl: function(url) {
      const nextEp = j.$('#StreamNextEpisode .episode-play').attr('data-key');
      if (!nextEp) {
        return nextEp;
      }
      if (nextEp !== url.split('/')[5]) {
        return `${Hidive.domain}/stream/${j
          .$('#StreamNextEpisode .episode-play')
          .attr('data-videotitle')}/${nextEp}`;
      } else {
        return undefined;
      }
    },
  },

  overview: {
    getTitle: function(url) {
      return j
        .$('div.text-container a')
        .text()
        .replace('Score It', '')
        .trim();
    },
    getIdentifier: function(url) {
      return url.split('/')[4];
    },
    uiSelector: function(selector) {
      j.$(
        `<div class="container"> <p id="malp">${selector.html()}</p></div>`,
      ).insertAfter(j.$('div.details').first());
    },
    list: {
      offsetHandler: false,
      elementsSelector: function() {
        return j
          .$(
            'div.episode-slider > div > div > div.cell > div:nth-child(1) > div.hitbox',
          )
          .filter(function() {
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
      elementUrl: function(selector) {
        return selector.find('div.player > a').attr('data-playurl') || '';
      },
      elementEp: function(selector) {
        const temp = selector.find('div.player > a').attr('data-key');
        const regex = /^\d/;
        if (temp && regex.test(temp)) {
          return Number(temp.slice(8));
        } else if (temp) {
          return Number(temp.slice(4));
        } else {
          return 0;
        }
      },
    },
  },

  init(page) {
    if (document.title == 'Just a moment...') {
      con.log('loading');
      page.cdn();
      return;
    }
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
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
