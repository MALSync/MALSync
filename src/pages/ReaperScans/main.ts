import { pageInterface } from '../pageInterface';

export const ReaperScans: pageInterface = {
  name: 'ReaperScans',
  domain: 'https://reaperscans.com',
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    return utils.urlPart(url, 5) === 'chapters';
  },
  isOverviewPage(url) {
    if (url.split('/')[4] !== undefined && url.split('/')[4].length > 0) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j.$('h2').text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(
        j.$('div > a[href*="/comics/"]').first().attr('href'),
        ReaperScans.domain,
      );
    },
    getEpisode(url) {
      const episodePart = utils.urlPart(url, 6);

      const temp = episodePart.match(/chapter-(\d+)/i);

      if (!temp) return 0;

      return Number(temp[1]);
    },
    nextEpUrl(url) {
      return utils.absoluteLink(
        j.$('div[x-data*="Next Chapter"]').first().find('a').attr('href'),
        ReaperScans.domain,
      );
    },
  },
  overview: {
    getTitle(url) {
      return j.$('h1').first().text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('h1').first().after(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('div.pb-4 > div > ul > li');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.find('a').first().attr('href'), ReaperScans.domain);
      },
      elementEp(selector) {
        return ReaperScans.sync.getEpisode(ReaperScans.overview!.list!.elementUrl!(selector));
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

    utils.changeDetect(
      () => page.handleList(),
      () => j.$(ReaperScans.overview!.list!.elementsSelector()).text(),
    );
  },
};
