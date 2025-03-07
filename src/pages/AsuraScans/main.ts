import { pageInterface } from '../pageInterface';

export const AsuraScans: pageInterface = {
  name: 'AsuraScans',
  domain: [
    'https://asuratoon.com',
    'https://asuracomics.com',
    'https://asura.gg',
    'https://asurascans.com',
    'https://asuratoon.com',
    'https://asuracomic.net',
  ],
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    return (
      utils.urlPart(url, 3) === 'series' &&
      Boolean(utils.urlPart(url, 4)) &&
      utils.urlPart(url, 5) === 'chapter'
    );
  },
  isOverviewPage(url) {
    return (
      utils.urlPart(url, 3) === 'series' && Boolean(utils.urlPart(url, 4)) && !utils.urlPart(url, 5)
    );
  },
  sync: {
    getTitle(url) {
      const path = url.split('/').slice(3, 5).join('/');
      return j.$(`a[href*="${path}"] span, a[href*="${path}"] h3`).first().text().trim();
    },
    getIdentifier(url) {
      return AsuraScans.overview!.getIdentifier(AsuraScans.sync.getOverviewUrl(url));
    },
    getOverviewUrl(url) {
      return url.split('/').slice(0, 5).join('/');
    },
    getEpisode(url) {
      return Number(utils.urlPart(url, 6));
    },
    nextEpUrl(url) {
      const currentChapter = AsuraScans.sync.getEpisode(url);
      if (!currentChapter) return undefined;

      const path = `${url.split('/').slice(3, 6).join('/')}/${currentChapter + 1}`;

      if (j.$(`a[href*="${path}"]`).length) {
        return utils.absoluteLink(path, AsuraScans.domain);
      }

      return undefined;
    },
  },
  overview: {
    getTitle(url) {
      return j.$('.space-y-4 .text-xl').text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4).replace(/-[^-]+$/gi, '');
    },
    uiSelector(selector) {
      j.$('.space-y-4')
        .first()
        .after(j.html(`<div id= "malthing" class="bg-[#222222]">${selector}</div>`));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('.overflow-y-auto > a');
      },
      elementUrl(selector) {
        let href = selector.attr('href');
        if (!href) return '';

        if (utils.urlPart(href, 1) === 'chapter') {
          href = `series/${href}`;
        }

        return utils.absoluteLink(href, AsuraScans.domain);
      },
      elementEp(selector) {
        return AsuraScans.sync.getEpisode(AsuraScans.overview!.list!.elementUrl!(selector));
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(document).ready(function () {
      if (document.title.includes('Page not found')) {
        con.error('404');
        return;
      }

      page.handlePage();
    });
  },
};
