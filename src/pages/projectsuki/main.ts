import { pageInterface } from '../pageInterface';

export const projectsuki: pageInterface = {
  domain: 'https://projectsuki.com',
  languages: ['English'],
  name: 'projectsuki',
  type: 'manga',
  isSyncPage(url) {
    return utils.urlPart(url, 3) === 'read';
  },
  isOverviewPage(url) {
    return utils.urlPart(url, 3) === 'book';
  },
  getImage() {
    return j.$('.img-thumbnail').attr('src');
  },
  sync: {
    getTitle(url) {
      return $('.w-5').attr('title') || '';
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4) || '';
    },
    getOverviewUrl(url) {
      return utils.absoluteLink($('.w-5').attr('href'), projectsuki.domain);
    },
    getEpisode(url) {
      return parseInt($('#chapter-select option:checked').text().match(/\d+/g)![0]);
    },
    nextEpUrl(url) {
      return utils.absoluteLink($('.read a:nth-child(4)').attr('href'), projectsuki.domain);
    },
  },
  overview: {
    getTitle(url) {
      return j.$('h2 ').text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4) || '';
    },
    uiSelector(selector) {
      j.$('.w-100').before(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('tbody > tr');
      },
      elementUrl(selector) {
        return utils.absoluteLink(
          selector.find('td:first-child > a').attr('href'),
          projectsuki.domain,
        );
      },
      elementEp(selector) {
        return parseInt(
          selector
            .find('td:first-child > a')
            .text()
            .match(/Chapter (\d+)/i)![1],
        );
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      // eslint-disable-next-line global-require
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    page.handlePage();
  },
};
