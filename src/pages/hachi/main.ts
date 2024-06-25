import { pageInterface } from '../pageInterface';

export const hachi: pageInterface = {
  domain: 'https://hachi.moe',
  languages: ['English'],
  name: 'hachi',
  type: 'manga',
  isSyncPage(url) {
    return /\/chapter\/\d+/.test(url);
  },
  isOverviewPage(url) {
    return url.includes('/article/') && !url.includes('/chapter/');
  },
  sync: {
    getTitle: () => {
      return j.$('h1').text();
    },
    getIdentifier: (url: string) => {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl: (url: string) => {
      return utils.absoluteLink(url.replace(/\/chapter\/[\d.]+$/, ''), hachi.domain);
    },
    getEpisode: (url: string) => {
      return parseInt(utils.urlPart(url, 6)) || -1;
    },
    nextEpUrl: () => {
      return utils.absoluteLink(
        j.$('a[data-with-right-section="true"]').attr('href')!,
        hachi.domain,
      );
    },
  },
  overview: {
    getTitle: () => {
      return j
        .$('h1')
        .text()
        .replace(/(.+?)\1+/g, '$1');
    },
    getIdentifier: (url: string) => {
      return utils.urlPart(url, 4);
    },
    uiSelector: (selector: string) => {
      j.$('#mal').first().prepend(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('div.mantine-SimpleGrid-root > a');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.attr('href')!, hachi.domain);
      },
      elementEp(selector) {
        return hachi.sync.getEpisode(hachi.overview!.list!.elementUrl!(selector));
      },
    },
  },
  init: page => {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    utils.fullUrlChangeDetect(() => {
      page.reset();
      utils.waitUntilTrue(
        () => {
          return !!j.$('h1').length;
        },
        () => {
          page.handlePage().then(() => {});
        },
      );
    });
  },
};
