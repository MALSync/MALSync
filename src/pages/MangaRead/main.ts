import { pageInterface } from '../pageInterface';

export const MangaRead: pageInterface = {
  name: 'MangaRead',
  domain: ['https://www.mangaread.org'],
  database: undefined,
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    return (
      typeof url.split('/')[3] !== 'undefined' &&
      url.split('/')[3] === 'manga' &&
      typeof url.split('/')[5] !== 'undefined' &&
      url.split('/')[5].startsWith('chapter-')
    );
  },
  isOverviewPage(url) {
    return (
      typeof url.split('/')[3] !== 'undefined' &&
      url.split('/')[3] === 'manga' &&
      (typeof url.split('/')[5] === 'undefined' || url.split('/')[5] === '')
    );
  },
  getImage() {
    return $('div.summary_image > a > img').attr('src');
  },
  sync: {
    getTitle(url) {
      return j.$('div.c-breadcrumb-wrapper > div > ol > li:nth-child(2) > a').text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl(url) {
      return j.$('div.c-breadcrump-wrapper > div > ol > li:nth-child(2) > a').attr('href') || '';
    },
    getEpisode(url) {
      const episodePart = utils.urlPart(url, 5);
      const temp = episodePart.match(/chapter-([-\d]+)/gi);
      if (!temp || !temp.length) return 0;
      return Number(temp[0].replace('chapter-', '').replace('-', '.'));
    },
    nextEpUrl(url) {
      return j.$('div.nav-links > div.nav-next > a.next_page').attr('href') || '';
    },
    readerConfig: [
      {
        current: {
          selector: 'img.wp-manga-chapter-img',
          mode: 'countAbove',
        },
        total: {
          selector: 'img.wp-manga-chapter-img',
          mode: 'count',
        },
      },
    ],
  },
  overview: {
    getTitle(url) {
      return j.$('div.post-title > h1').text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('div.tab-summary').first().after(j.html(`<div id="malthing"><h2>MAL-Sync</h2><div class="info">${selector}</div></div>`));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('div.listing-chapters_wrap > ul.version-chap > li.wp-manga-chapter');
      },
      elementUrl(selector) {
        return selector.find('a').first().attr('href') || '';
      },
      elementEp(selector) {
        return MangaRead.sync.getEpisode(String(selector.find('a').first().attr('href')));
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(() => {
      if (document.title.includes('Not Found')) {
        con.error('404');
        return;
      }
      page.handlePage();
    });
  },
};
