import { SafeError } from '../../utils/errors';
import { pageInterface } from '../pageInterface';

export const AnimeDao: pageInterface = {
  name: 'AnimeDao',
  domain: 'https://animedao.to',
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    if (
      url.split('/')[3] === 'watch' &&
      url.split('/')[4] !== undefined &&
      url.split('/')[4].length
    ) {
      return true;
    }
    return false;
  },
  isOverviewPage(url) {
    if (
      url.split('/')[3] === 'anime' &&
      url.split('/')[4] !== undefined &&
      url.split('/')[4].length
    ) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j
        .$('div.animeinfo_top > span.animename')
        .text()
        .replace(/episode.*/i, '')
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(AnimeDao.sync.getOverviewUrl(url), 4);
    },
    getOverviewUrl(url) {
      return utils.urlStrip(
        utils.absoluteLink(
          j.$('div.btn-group > a[href*="/anime/"]').attr('href') || '',
          AnimeDao.domain,
        ),
      );
    },
    getEpisode(url) {
      const text = $('div.animeinfo_top > span.animename').text().toLowerCase();
      if (text.includes('special') || text.includes('ova') || text.includes('movie')) {
        throw new SafeError('specials are not supported');
      }
      if (!text.includes('episode')) {
        throw new SafeError('episode is missing');
      }
      return episodePartToEpisode(text);
    },
    nextEpUrl(url) {
      const href = j
        .$('div.btn-group > a[href*="/view/"] > button > .fa-arrow-right')
        .closest('a')
        .attr('href');
      if (href) return utils.absoluteLink(href, AnimeDao.domain);
      return '';
    },
  },
  overview: {
    getTitle(url) {
      return j.$('div.component-animeinfo h2 > b').text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('#hometab').before(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('#episodes-tab-pane > div > div:nth-child(1) > div.episodelist');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.find('a').attr('href'), AnimeDao.domain);
      },
      elementEp(selector) {
        try {
          return episodePartToEpisode(selector.find('a').attr('title'));
        } catch (error) {
          return NaN;
        }
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(document).ready(function () {
      if (document.title.includes('Not Found')) {
        con.error('404');
        return;
      }
      page.handlePage();
    });
  },
};

function episodePartToEpisode(string) {
  let temp = [];
  temp = string.match(/episode\D?(\d+)/i);
  if (temp !== null) {
    return temp[1];
  }
  return 1;
}
