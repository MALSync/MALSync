import { pageInterface } from '../pageInterface';

export const AnimeOnDemand: pageInterface = {
  name: 'AnimeOnDemand',
  domain: 'https://www.anime-on-demand.de',
  languages: ['German'],
  type: 'anime',
  isSyncPage(url) {
    if (url.split('/')[3] === 'anime' && url.split('/')[4] !== undefined && url.split('/')[4].length > 0) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j
        .$('div.l-mainsection > div.l-maincontent > div> h1[itemprop=name]')
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl(url) {
      return `${AnimeOnDemand.domain}/anime/${AnimeOnDemand.sync.getIdentifier(url)}`;
    },
    getEpisode(url) {
      const episodeTitle = j.$('#player_container div.jw-title > div.jw-title-primary').text();
      if (episodeTitle.length) {
        if (typeof episodePartToEpisode(episodeTitle) !== 'undefined')
          return Number(episodePartToEpisode(episodeTitle));
        return 1;
      }
      return NaN;
    },
    uiSelector(selector) {
      j.$('div.l-mainsection > div.l-maincontent > div> h1[itemprop=name]').after(j.html(selector));
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());

    utils.changeDetect(loaded, () => {
      return `${AnimeOnDemand.sync.getEpisode(page.url)}`;
    });

    function loaded() {
      page.reset();
      page.handlePage();
    }
  },
};

function episodePartToEpisode(string) {
  if (!string) return undefined;
  let temp = [];
  temp = string.match(/(ep\.|episode)\D?\d+/i);
  if (temp !== null) {
    string = temp[0];
    temp = string.match(/\d+/);
    if (temp !== null) {
      return temp[0];
    }
  }
  return undefined;
}
