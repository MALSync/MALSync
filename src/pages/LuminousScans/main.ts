import { pageInterface } from '../pageInterface';

function cleanUrl(url: string) {
  if (utils.urlPart(url, 4) === 'series') {
    return url.replace(`/${utils.urlPart(url, 3)}`, '');
  }
  return url;
}

export const LuminousScans: pageInterface = {
  name: 'LuminousScans',
  domain: ['https://luminous-scans.com', 'https://luminousscans.com'],
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    return j.$('div.allc').length > 0;
  },
  isOverviewPage(url) {
    if (utils.urlPart(cleanUrl(url), 3) === 'series' && utils.urlPart(cleanUrl(url), 4))
      return true;
    return false;
  },
  getImage() {
    return j.$('div.thumb img').attr('src');
  },
  sync: {
    getTitle(url) {
      return j.$('.ts-breadcrumb li:nth-child(2) [itemprop="name"]').text().trim();
    },
    getIdentifier(url) {
      return LuminousScans.overview!.getIdentifier(LuminousScans.sync.getOverviewUrl(url));
    },
    getOverviewUrl(url) {
      return j.$('.ts-breadcrumb li:nth-child(2) a').attr('href') || '';
    },
    getEpisode(url) {
      const episodePart = utils.urlPart(cleanUrl(url), 3) + utils.urlPart(cleanUrl(url), 4);

      const temp = episodePart.match(/-chapter-(\d+)/im);

      if (!temp) return NaN;

      return Number(temp[1]);
    },
    nextEpUrl(url) {
      const nextButton = j.$('a.ch-next-btn:first').attr('href');
      if (nextButton === '#/next/') return undefined;
      return nextButton;
    },
  },
  overview: {
    getTitle(url) {
      return j.$('#titlemove [itemprop="name"]').text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(cleanUrl(url), 4);
    },
    uiSelector(selector) {
      j.$('#series-history').first().after(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('#chapterlist .chbox');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.find('a').first().attr('href'), LuminousScans.domain);
      },
      elementEp(selector) {
        return LuminousScans.sync.getEpisode(LuminousScans.overview!.list!.elementUrl!(selector));
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
