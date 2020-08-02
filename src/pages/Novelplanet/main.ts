import { pageInterface } from '../pageInterface';

export const Novelplanet: pageInterface = {
  name: 'Novelplanet',
  domain: 'https://novelplanet.com',
  database: 'Novelplanet',
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    if (utils.urlPart(url, 5)) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j
        .$('#main .title')
        .first()
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4) || '';
    },
    getOverviewUrl(url) {
      return url
        .split('/')
        .slice(0, 5)
        .join('/');
    },
    getEpisode(url) {
      return getEp(
        $('.selectChapter option')
          .first()
          .text(),
      );
    },
    getVolume(_url) {
      const url = $('.selectChapter option')
        .first()
        .text();

      if (!url) return NaN;

      const volumeText = url.match(/vol(ume)\D?\d+/i);

      if (!volumeText || volumeText.length === 0) return NaN;

      const volumeNumber = url.match(/\d+/);

      if (!volumeNumber || volumeNumber.length === 0) return NaN;

      return Number(volumeNumber[0]);
    },
    nextEpUrl(url) {
      return utils.absoluteLink(
        j
          .$('div.row > div:nth-child(5)  > a')
          .first()
          .attr('href'),
        Novelplanet.domain,
      );
    },
  },
  overview: {
    getTitle() {
      return j
        .$('.post-contentDetails .title')
        .first()
        .text();
    },
    getIdentifier(url) {
      return Novelplanet.sync.getIdentifier(url);
    },
    uiSelector(selector) {
      j.$('.post-contentDetails p')
        .first()
        .after(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('.rowChapter');
      },
      elementUrl(selector) {
        return utils.absoluteLink(
          selector
            .find('a')
            .first()
            .attr('href'),
          Novelplanet.domain,
        );
      },
      elementEp(selector) {
        return getEp(
          selector
            .find('a')
            .first()
            .text(),
        );
      },
    },
  },
  init(page) {
    page.novel = true;
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      page.handlePage();
    });
  },
};

function getEp(episodePart) {
  let temp = episodePart.match(/[c,C][h,H][a,A]?[p,P]?[t,T]?[e,E]?[r,R]?\D?\d+/);
  if (temp === null) {
    episodePart = episodePart.replace(/[V,v][o,O][l,L]\D?\d+/, '');
    temp = episodePart.match(/\d{3}/);
    if (temp === null) {
      temp = episodePart.match(/\d+/);
      if (temp === null) {
        episodePart = 0;
      } else {
        episodePart = temp[0];
      }
    } else {
      episodePart = temp[0];
    }
  } else {
    episodePart = temp[0].match(/\d+/)[0];
  }
  return episodePart;
}
