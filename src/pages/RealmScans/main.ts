import { pageInterface } from '../pageInterface';

export const RealmScans: pageInterface = {
  name: 'RealmScans',
  domain: 'https://realmscans.com/',
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    if (
      j.$(
        'div.entry-content.entry-content-single.maincontent > div.chnav.ctop.nomirror > span.selector.slc.l > div',
      ).length
    ) {
      return true;
    }
    return false;
  },
  isOverviewPage(url) {
    return utils.urlPart(url, 3) === 'series';
  },
  getImage() {
    return j.$('div.main-info > div.info-left > div > div.thumb > img').attr('src');
  },
  sync: {
    getTitle(url) {
      return j.$('div.ts-breadcrumb.bixbox > ol > li:nth-child(2) > a > span').text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 3).split('-chapter-')[0];
    },
    getOverviewUrl(url) {
      return j.$('div.ts-breadcrumb.bixbox > ol > li:nth-child(2) > a').attr('href') || '';
    },
    getEpisode(url) {
      let episodePart = utils.urlPart(url, 3).split('-chapter-')[1];

      if (!episodePart || !episodePart.length) return 0;

      if (episodePart.includes('-') === true) {
        episodePart = episodePart.split('-')[0];
      }
      return Number(episodePart);
    },
    nextEpUrl(url) {
      return j
        .$(
          'div.entry-content.entry-content-single.maincontent > div.chnav.ctop.nomirror > span.navlef > span.npv.r > div > a.ch-next-btn',
        )
        .attr('src');
    },
  },
  overview: {
    getTitle(url) {
      return j.$('#titlemove > h1').text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 3);
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
