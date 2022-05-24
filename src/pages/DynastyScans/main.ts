import { pageInterface } from '../pageInterface';

export const DynastyScans: pageInterface = {
  name: 'DynastyScans',
  domain: 'https://dynasty-scans.com',
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    return (
      typeof url.split('/')[3] !== 'undefined' &&
      url.split('/')[3] === 'chapters' &&
      typeof url.split('/')[4] !== 'undefined' &&
      url.split('/')[4].length > 0
    );
  },
  isOverviewPage(url) {
    return (
      typeof url.split('/')[3] !== 'undefined' &&
      url.split('/')[3] === 'series' &&
      typeof url.split('/')[4] !== 'undefined' &&
      url.split('/')[4].length > 0
    );
  },
  getImage() {
    return utils.absoluteLink(j.$('.cover > img.thumbnail').attr('src'), DynastyScans.domain);
  },
  sync: {
    getTitle(url) {
      return j.$('#chapter-title > b > a').text() || j.$('#chapter-title > b').text();
    },
    getIdentifier(url) {
      return utils.urlPart(
        utils.absoluteLink(DynastyScans.sync.getOverviewUrl(url), DynastyScans.domain),
        4,
      );
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(j.$('#chapter-title > b > a').attr('href'), DynastyScans.domain);
    },
    getEpisode(url) {
      const episodePart = utils.urlPart(url, 4);

      const temp = episodePart.match(/_ch(\d+)/i);

      if (!temp || !temp.length) return 1;

      return Number(temp[1]);
    },
    nextEpUrl(url) {
      const nexthref = j.$('#next_link').first().attr('href');
      if (nexthref !== '#') {
        return utils.absoluteLink(nexthref, DynastyScans.domain);
      }
      return '';
    },
  },
  overview: {
    getTitle(url) {
      return j.$('h2.tag-title > b').text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('div.row.cover-chapters').first().before(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return $($('dl.chapter-list > dd').get().reverse());
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.find('a').first().attr('href'), DynastyScans.domain);
      },
      elementEp(selector) {
        return DynastyScans.sync.getEpisode(DynastyScans.overview!.list!.elementUrl!(selector));
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(() => {
      if (document.title.includes("The page you were looking for doesn't exist")) {
        con.error('404');
        return;
      }
      page.handlePage();
    });
  },
};
