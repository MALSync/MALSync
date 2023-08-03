import { pageInterface } from '../pageInterface';

export const ManhwaFreak: pageInterface = {
  name: 'ManhwaFreak',
  domain: ['https://manhwafreak.com'],
  database: 'ManhwaFreak',
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    if ($('div.chnav.ctop.nomirror').length > 0) {
      return true;
    }
    return false;
  },
  isOverviewPage(url) {
    if ($('div.bigbanner').length > 0) {
      return true;
    }
    return false;
  },
  getImage() {
    return $('section.series > div.info > img').attr('src');
  },
  sync: {
    getTitle(url) {
      return j.$('div.breadcrumb > ul > li:nth-child(3) > a >span').text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 3);
    },
    getOverviewUrl(url) {
      return j.$('div.breadcrumb > ul > li:nth-child(3) > a').attr('href') || '';
    },
    getEpisode(url) {
      const episodePart = utils.urlPart(url, 3);

      const temp = episodePart.match(/ch[_-]\d+/gi);

      if (!temp || !temp.length) return 0;

      return Number(temp[0].replace(/\D+/g, ''));
    },
    nextEpUrl(url) {
      return j.$('div.nextprev > a.ch-next-btn').first().attr('href');
    },
    readerConfig: [
      {
        current: {
          selector: 'div#readerarea. img',
          mode: 'countAbove',
        },
        total: {
          selector: 'div#readerarea. img',
          mode: 'count',
        },
      },
    ],
  },
  overview: { 
    getTitle(url) {
      return j.$('div.wrapper > section.series > h1.title').text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('div.wrapper > section.series > div.info > div.container > div.card')
        .first()
        .before(
          j.html(
            `<div id="malthing" class="bixbox bxcl epcheck"><div class="releases"><h2>MAL-Sync</h2></div>${selector}</div>`,
          ),
        );
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('div.chapter-li > a');
      },
      elementUrl(selector) {
        return selector.find('a').first().attr('href') || '';
      },
      elementEp(selector) {
        return ManhwaFreak.sync.getEpisode(String(selector.find('a').first().attr('href')));
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