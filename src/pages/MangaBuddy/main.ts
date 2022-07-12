import { pageInterface } from '../pageInterface';

export const MangaBuddy: pageInterface = {
  name: 'MangaBuddy',
  domain: 'https://mangabuddy.com',
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    return j.$('div.reading-box').length > 0;
  },
  isOverviewPage(url) {
    return j.$('div.read-box').length > 0;
  },
  getImage() {
    return j.$('div.img-cover img').attr('src');
  },
  sync: {
    getTitle(url) {
      return j.$('div.breadcrumbs-item:nth-child(2) span').text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 3);
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(MangaBuddy.sync.getIdentifier(url), MangaBuddy.domain);
    },
    getEpisode(url) {
      const episodePart = utils.urlPart(url, 4);

      const temp = episodePart.match(/chapter-(\d+)/im);

      if (!temp) return NaN;

      return Number(temp[1]);
    },
    nextEpUrl(url) {
      const next = j.$('#btn-next').attr('href');

      if (next === '#') return undefined;

      return utils.absoluteLink(next, MangaBuddy.domain);
    },
  },
  overview: {
    getTitle(url) {
      return j.$('div.detail h1').text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 3);
    },
    uiSelector(selector) {
      j.$('div.summary')
        .first()
        .after(
          j.html(
            `<div id= "MALSyncheading" class="heading"> <span class="text-highlight">MAL-Sync</span></div><div id="malthing">${selector}</div>`,
          ),
        );
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('#chapter-list-inner li');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.find('a').first().attr('href'), MangaBuddy.domain);
      },
      elementEp(selector) {
        return MangaBuddy.sync.getEpisode(MangaBuddy.overview!.list!.elementUrl!(selector));
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(() => {
      if (j.$('div.box-404 h1').text() === "Whoops, 404 – Sorry, this page can't be found.") {
        con.error('404');
        return;
      }
      page.handlePage();
    });
    const handleTimeout = 5e2;
    j.$('div#show-more-chapters span').on('click', () => {
      setTimeout(() => {
        page.handleList();
      }, handleTimeout);
    });
  },
};
