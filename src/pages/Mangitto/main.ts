import { pageInterface } from '../pageInterface';

export const Mangitto: pageInterface = {
  name: 'Mangitto',
  domain: ['https://mangtto.com'],
  languages: ['Turkish'],
  type: 'manga',
  isSyncPage(url: string) {
    return url.split('/')[3] === 'manga' && url.split('/')[5] !== undefined && url.split('/')[5].length > 0;
  },
  sync: {
    getTitle(url: string) {
      return j.$('a.font-bold').text();
    },
    getIdentifier(url: string) {
      return utils.urlPart(url, 4) || '';
    },
    getOverviewUrl(url: string) {
      return (utils.absoluteLink(j.$('a.font-bold').attr('href'), Mangitto.domain) || '').replace(/\/$/, '');
    },
    getEpisode(url: string) {
      return Number(utils.urlPart(url, 5));
    },
    nextEpUrl(url: string) {
      return utils.absoluteLink(j.$('a.bg-mangitto-buttonGray[class*="flex-row-reverse"]:contains("Sonraki Bölüm")').attr('href'), Mangitto.domain) || '';
    },
  },
  overview: {
    getTitle(url: string) {
      return j.$("h1").first().text().trim();
    },
    getIdentifier(url: string) {
      return utils.urlPart(url, 4) || '';
    },
    uiSelector(selector: string) {
      j.$('h1').first().after(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('div.grid.grid-cols-2 > div > a');
      },
      elementUrl(selector: any) {
        return utils.absoluteLink(selector.attr('href'), Mangitto.domain);
      },
      elementEp(selector: any) {
        const url = utils.absoluteLink(selector.attr('href'), Mangitto.domain);
        return Number(utils.urlPart(url, 5));
      },
    },
  },
  init(page: any) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(document).ready(function () {
      if (page.url.split('/')[3] === 'manga') {
        page.handlePage();
      }
    });

    utils.urlChangeDetect(() => {
      page.reset();
      setTimeout(() => {
        page.handlePage();
      }, 500);
    });
  },
};
