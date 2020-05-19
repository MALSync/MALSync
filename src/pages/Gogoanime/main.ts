import { pageInterface } from './../pageInterface';

export const Gogoanime: pageInterface = {
  name: 'Gogoanime',
  domain: [
    'https://gogoanimes.co',
    'https://gogoanime.tv',
    'https://animego.to',
  ],
  database: 'Gogoanime',
  type: 'anime',
  isSyncPage: function(url) {
    if (utils.urlPart(url, 3) === 'category') {
      return false;
    } else {
      return true;
    }
  },
  sync: {
    getTitle: function(url) {
      return j
        .$('.anime-info a')
        .first()
        .text()
        .trim();
    },
    getIdentifier: function(url) {
      return utils.urlPart(url, 3).split('-episode')[0];
    },
    getOverviewUrl: function(url) {
      return `${url
        .split('/')
        .slice(0, 3)
        .join('/')}/category/${Gogoanime.sync.getIdentifier(url)}`;
    },
    getEpisode: function(url) {
      return Number(utils.urlPart(url, 3).split('episode-')[1]);
    },
    nextEpUrl: function(url) {
      const href = j
        .$('.anime_video_body_episodes_r a')
        .last()
        .attr('href');
      if (typeof href !== 'undefined') {
        return Gogoanime.domain + href;
      }
    },
  },
  overview: {
    getTitle: function(url) {
      return Gogoanime.overview!.getIdentifier(url);
    },
    getIdentifier: function(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector: function(selector) {
      selector.prependTo(j.$('.anime_info_body').first());
    },
    list: {
      offsetHandler: false,
      elementsSelector: function() {
        return j.$('#episode_related a');
      },
      elementUrl: function(selector) {
        const anchorHref = selector.attr('href');

        if (!anchorHref) return;

        return utils.absoluteLink(
          anchorHref.replace(/^ /, ''),
          Gogoanime.domain,
        );
      },
      elementEp: function(selector) {
        const url = Gogoanime.overview!.list!.elementUrl(selector);
        return Gogoanime.sync.getEpisode(url);
      },
      paginationNext: function() {
        let next = false;
        let nextReturn = false;
        j.$(
          j
            .$('#episode_page a')
            .get()
            .reverse(),
        ).each(function(index, el) {
          if (next && !nextReturn) {
            el.click();
            nextReturn = true;
            return;
          }
          if (j.$(el).hasClass('active')) {
            next = true;
          }
        });
        return nextReturn;
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    if (Gogoanime.isSyncPage(page.url)) {
      j.$(document).ready(function() {
        start();
      });
    } else {
      con.log('noSync');
      utils.waitUntilTrue(
        function() {
          return j.$('#episode_related').length;
        },
        function() {
          start();
        },
      );
    }

    function start() {
      Gogoanime.domain = `${window.location.protocol}//${window.location.hostname}`;
      page.handlePage();

      j.$('#episode_page').click(function() {
        setTimeout(function() {
          page.handleList();
        }, 500);
      });
    }
  },
};
