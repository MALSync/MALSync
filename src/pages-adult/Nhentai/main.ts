import { pageInterface } from '../../pages/pageInterface';

function cleanTitle(title) {
  return title.replace(/(\([^)]*\)|\[[^\]]*\])/g, '').trim();
}

export const Nhentai: pageInterface = {
  name: 'Nhentai',
  domain: 'https://nhentai.net',
  languages: ['English', 'Chinese', 'Japanese'],
  type: 'manga',
  isSyncPage(url) {
    if (url.split('/')[5] && url.split('/')[5].length) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      const scripts = j
        .$('script')
        .text()
        .replace(/\\u0022/g, '"');

      con.info(scripts);
      try {
        const pl = '';
        return scripts.split(`"pretty":${pl}"`)[1].split('"}')[0];
      } catch (e) {
        return '';
      }
    },
    getIdentifier(url) {
      return url.split('/')[4];
    },
    getOverviewUrl(url) {
      return `${Nhentai.domain}/g/${Nhentai.sync.getIdentifier(url)}`;
    },
    getEpisode(url) {
      try {
        const scripts = j.$('script').text();
        let episodePart;
        if (scripts.indexOf('"english":"') !== -1) {
          episodePart = scripts.split('"english":"')[1].split('"')[0];
        } else {
          episodePart = scripts.split('"japanese":"')[1].split('"')[0];
        }
        if (episodePart.length) {
          const temp = episodePart.match(/(ch|ch.|chapter).?\d+/gim);
          if (temp !== null) {
            return Number(temp[0].replace(/\D+/g, ''));
          }
        }
      } catch (e) {
        con.info(e);
      }
      return 1;
    },
  },
  overview: {
    getTitle() {
      return cleanTitle(
        j
          .$('meta[itemprop="name"]')
          .first()
          .attr('content'),
      );
    },
    getIdentifier(url) {
      return Nhentai.sync.getIdentifier(url);
    },
    uiSelector(selector) {
      j.$('#info h1')
        .first()
        .after(j.html(selector));
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());

    j.$(document).ready(function() {
      if (page.url.match(/nhentai.[^/]*\/g\/\d+/i)) {
        page.handlePage();
      }
    });

    return;
    start();

    utils.changeDetect(start, () => {
      return window.location.href.replace(/\d*$/, '');
    });

    function start() {
      if (page.url.match(/nhentai.[^/]*\/g\/\d+/i)) {
        page.handlePage();
      }
    }
  },
};
