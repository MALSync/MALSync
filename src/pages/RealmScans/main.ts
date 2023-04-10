import { pageInterface } from '../pageInterface';

export const RealmScans: pageInterface = getInter();

export function getInter(): pageInterface {
  function cleanUrl(url: string) {
    if (utils.urlPart(url, 4) === 'series') {
      return url.replace(`/${utils.urlPart(url, 3)}`, '');
    }
    return url;
  }

  let thisSelf;
  /* eslint-disable-next-line prefer-const */
  thisSelf = {
    name: 'RealmScans',
    domain: 'https://realmscans.com',
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
        return j.$('.ts-breadcrumb li:nth-child(2) [itemprop="name"]').text();
      },
      getIdentifier(url) {
        return RealmScans.overview!.getIdentifier(RealmScans.sync.getOverviewUrl(url));
      },
      getOverviewUrl(url) {
        return j.$('.ts-breadcrumb li:nth-child(2) a').attr('href') || '';
      },
      getEpisode(url) {
        const episodePart = utils.urlPart(cleanUrl(url), 3);

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
        return j.$('#titlemove [itemprop="name"]').text();
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
  return thisSelf;
}
