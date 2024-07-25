import { pageInterface } from '../pageInterface';

export const MangaRead: pageInterface = {
  name: 'MangaRead',
  domain: ['https://www.mangaread.org'],
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
    return $('.summary_image img').first().attr('src');
  },
  sync: {
    getTitle(url) {
      return j.$('.breadcrumb li:nth-child(2) a').first().text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl(url) {
      return j.$('.breadcrumb li:nth-child(2) a').first().attr('href') || '';
    },
    getEpisode(url) {
      const episodePart = utils.urlPart(url, 5);
      const temp = episodePart.match(/chapter-([\d]+)/gi);
      if (!temp || !temp.length) return 0;
      return Number(temp[0].replace('chapter-', ''));
    },
    nextEpUrl(url) {
      return j.$('.nav-links a.next_page').attr('href') || '';
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
      return j.$('.post-title h1').text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('.tab-summary')
        .first()
        .after(
          j.html(`<div id="malthing"><h2>MAL-Sync</h2><div class="info">${selector}</div></div>`),
        );
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('.listing-chapters_wrap .wp-manga-chapter');
      },
      elementUrl(selector) {
        return selector.find('a').first().attr('href') || '';
      },
      elementEp(selector) {
        return MangaRead.sync.getEpisode(MangaRead.overview!.list!.elementUrl!(selector));
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
