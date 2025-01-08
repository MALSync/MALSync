import { pageInterface } from '../pageInterface';

export const tmofans: pageInterface = {
  name: 'tmofans',
  domain: [
    'https://zonatmo.com',
    'https://visortmo.com',
    'https://lectortmo.com',
    'https://tmofans.com',
  ],
  languages: ['Spanish'],
  type: 'manga',
  isSyncPage(url) {
    return Boolean(j.$('.viewer-container').length);
  },
  isOverviewPage(url) {
    return Boolean(utils.urlPart(url, 3) === 'library' && utils.urlPart(url, 4));
  },
  sync: {
    getTitle(url) {
      return j.$('h1').first().text().trim();
    },
    getIdentifier(url) {
      return tmofans.overview!.getIdentifier(tmofans.sync.getOverviewUrl(url));
    },
    getOverviewUrl(url) {
      const path = j.$('.nav-link[href*="library"]').last().attr('href');

      return path ? utils.absoluteLink(path, tmofans.domain) : '';
    },
    getEpisode(url) {
      const episodePart = utils.getBaseText($('#app h2').first()).trim();
      return chapter(episodePart);
    },
  },
  overview: {
    getTitle(url) {
      return utils.getBaseText($('.element-title').first()).trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 6) || '';
    },
    uiSelector(selector) {
      j.$('main .container').first().prepend(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('#chapters .upload-link');
      },
      elementUrl(selector) {
        const link = selector.find('.chapter-list-element .fa-play').first().parent().attr('href');
        return link ? utils.absoluteLink(link, tmofans.domain) : '';
      },
      elementEp(selector) {
        const text = selector.find('.btn-collapse').first().text();
        return chapter(text);
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(document).ready(function () {
      page.handlePage();
    });
  },
};

function chapter(episodePart: string): number {
  if (episodePart.length) {
    const temp = episodePart.match(/Capítulo *\d*/gim);
    if (temp !== null) {
      return Number(temp[0].replace(/\D+/g, ''));
    }
  }
  return NaN;
}
