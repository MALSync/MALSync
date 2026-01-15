import { pageInterface } from '../pageInterface';

const urlAnime = ['anime', 'comics'];

export const DisasterScans: pageInterface = {
  name: 'DisasterScans',
  domain: 'https://disasterscans.com',
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    return Boolean(
      urlAnime.includes(utils.urlPart(url, 3)) &&
      utils.urlPart(url, 5) &&
      utils.urlPart(url, 5).includes('chapter-'),
    );
  },
  isOverviewPage(url) {
    return Boolean(urlAnime.includes(utils.urlPart(url, 3)) && utils.urlPart(url, 5) === '');
  },
  getImage() {
    return j.$('[class^="comicDetails_coverImage"]').first().attr('src');
  },
  sync: {
    getTitle(url) {
      return j.$('[class^="chapter_comicName"]').last().text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl(url) {
      return url.split('/').slice(0, 5).join('/');
    },
    getEpisode(url) {
      const episodePart = utils.urlPart(url, 5);

      const temp = episodePart.match(/chapter-\d+/gim);

      if (!temp || !temp.length) return 0;

      return Number(temp[0].replace(/\D+/g, ''));
    },
  },
  overview: {
    getTitle(url) {
      return j.$('[class^="comicDetails_title"]').first().text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('[class^="comicDetails_chapters"]')
        .first()
        .after(
          j.html(
            `<div id="malthing"><div id= "MALSyncheading" class="c-blog__heading style-2 font-heading"><h2 class="h4"> <i class="icon ion-ios-star"></i> MAL-Sync</h2></div>${selector}</div>`,
          ),
        );
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('[class^="comicDetails_chapterBlob"]');
      },
      elementUrl(selector) {
        const link = selector.find('a').first().attr('href');
        return link ? utils.absoluteLink(link, DisasterScans.domain) : '';
      },
      elementEp(selector) {
        return DisasterScans.sync.getEpisode(DisasterScans.overview!.list!.elementUrl!(selector));
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(() => {
      if (DisasterScans.isSyncPage(page.url)) {
        page.handlePage();
      }
      if (DisasterScans.isOverviewPage!(page.url)) {
        utils.waitUntilTrue(
          function () {
            return j.$('[class^="comicDetails_chapterBlob"]').length > 0;
          },
          function () {
            page.handlePage();
          },
        );
      }
    });
  },
};
