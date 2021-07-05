import { pageInterface } from '../pageInterface';

export const Gogoanime: pageInterface = {
  name: 'Gogoanime',
  domain: ['https://gogoanime.tv', 'https://gogoanimes.co', 'https://animego.to'],
  database: 'Gogoanime',
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    if (utils.urlPart(url, 3) === 'category') {
      return false;
    }
    return true;
  },
  sync: {
    getTitle(url) {
      return j
        .$('.anime-info a')
        .first()
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 3).split('-episode')[0];
    },
    getOverviewUrl(url) {
      return `${url
        .split('/')
        .slice(0, 3)
        .join('/')}/category/${Gogoanime.sync.getIdentifier(url)}`;
    },
    getEpisode(url) {
      return Number(utils.urlPart(url, 3).split('episode-')[1]);
    },
    nextEpUrl(url) {
      const href = j
        .$('.anime_video_body_episodes_r a')
        .last()
        .attr('href');
      if (typeof href !== 'undefined') {
        return Gogoanime.domain + href;
      }
      return '';
    },
  },
  overview: {
    getTitle(url) {
      return j
        .$('.anime_info_body_bg > h1')
        .first()
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('.anime_info_body')
        .first()
        .prepend(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('#episode_related a');
      },
      elementUrl(selector) {
        const anchorHref = selector.attr('href');

        if (!anchorHref) return '';

        return utils.absoluteLink(anchorHref.replace(/^ /, ''), Gogoanime.domain);
      },
      elementEp(selector) {
        const url = Gogoanime.overview!.list!.elementUrl(selector);
        return Gogoanime.sync.getEpisode(url);
      },
      paginationNext() {
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
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
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
