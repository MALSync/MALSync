import { pageInterface } from '../pageInterface';

export const RealmScans: pageInterface = {
  name: 'RealmScans',
  domain: 'https://realmscans.com',
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    return j.$('#screenmode').length > 0;
  },
  isOverviewPage(url) {
    return utils.urlPart(url, 3) === 'series';
  },
  getImage() {
    return j.$('div.thumb > img').attr('src');
  },
  sync: {
    getTitle(url) {
      return j.$('ol > li:nth-child(2) > a > span').text();
    },
    getIdentifier(url) {
      const temp_ident = j.$('ol > li:nth-child(2) > a').attr('href') || '';
      return utils.urlPart(temp_ident, 4);
    },
    getOverviewUrl(url) {
      return j.$('ol > li:nth-child(2) > a').attr('href') || '';
    },
    getEpisode(url) {
      const episodePart = utils.urlPart(url, 3);

      const temp = episodePart.match(/-chapter-\d+/gim);

      if (!temp || temp.length === 0) return 1;

      return Number(temp[0].replace(/\D+/g, ''));
    },
    nextEpUrl(url) {
      return j.$('a.ch-next-btn:first').attr('src');
    },
  },
  overview: {
    getTitle(url) {
      return j.$('#titlemove > h1').text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('#series-history').first().after(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('#chapterlist > ul > li > div');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.find('a').first().attr('href'), RealmScans.domain);
      },
      elementEp(selector) {
        return RealmScans.sync.getEpisode(RealmScans.overview!.list!.elementUrl!(selector));
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(() => {
      if (document.title.includes('Page not found')) {
        con.error('404');
        return;
      }
      page.handlePage();
    });
  },
};
