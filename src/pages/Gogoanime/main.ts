import { pageInterface } from '../pageInterface';

export const Gogoanime: pageInterface = {
  name: 'Gogoanime',
  domain: [
    'https://gogoanime.tv',
    'https://gogoanimes.co',
    'https://gogoanimehd.io',
    'https://gogoanime3.net',
    'https://anitaku.to',
  ],
  database: 'Gogoanime',
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    return Boolean(utils.urlPart(url, 3) !== 'category' && j.$('.anime_video_body').length);
  },
  isOverviewPage(url) {
    return utils.urlPart(url, 3) === 'category';
  },
  sync: {
    getTitle(url) {
      return j.$('.anime-info a').first().text().trim();
    },
    getIdentifier(url) {
      return Gogoanime.sync.getOverviewUrl(url).split('/')[4];
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(
        j.$('.anime-info a[href*="/category/"]').first().attr('href'),
        Gogoanime.domain,
      );
    },
    getEpisode(url) {
      const temp = utils.urlPart(url, 3).match(/episode-(\d+)/i);
      if (!temp) return NaN;
      return Number(temp[1]);
    },
    nextEpUrl(url) {
      const href = j.$('.anime_video_body_episodes_r a').last().attr('href');
      if (typeof href !== 'undefined') {
        return utils.absoluteLink(href, Gogoanime.domain);
      }
      return '';
    },
  },
  overview: {
    getTitle(url) {
      return j.$('.anime_info_body_bg > h1').first().text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('.anime_info_body').first().prepend(j.html(selector));
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
        const url = Gogoanime.overview!.list!.elementUrl!(selector);
        return Gogoanime.sync.getEpisode(url);
      },
      paginationNext() {
        let next = false;
        let nextReturn = false;
        j.$(j.$('#episode_page a').get().reverse()).each(function (index, el) {
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

    j.$(document).ready(function () {
      Gogoanime.domain = `${window.location.protocol}//${window.location.hostname}`;
      page.handlePage();

      utils.waitUntilTrue(
        () => j.$('#episode_related').length,
        () => page.handleList(),
      );

      j.$('#episode_page').click(function () {
        setTimeout(function () {
          page.handleList();
        }, 500);
      });
    });
  },
};
