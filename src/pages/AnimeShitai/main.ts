import { pageInterface } from '../pageInterface';

export const AnimeShitai: pageInterface = {
  name: 'AnimeShitai',
  domain: 'https://www.anime-shitai.com',
  languages: ['German'],
  type: 'anime',
  isSyncPage(url) {
    if (url.split('/')[3] === 'anschauen') {
      return true;
    }
    return false;
  },
  isOverviewPage(url) {
    if (url.split('/')[3] === 'info' || url.split('/')[3] === 'anime') {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j
        .$('div.title > span.navmiddle')
        .first()
        .text()
        .replace(/(?=-).*?$/, '')
        .replace(/:\s*$/, '')
        .replace(/staffel/gi, 'season')
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(j.$('div.content > div.dish > a[href*="/info"]').attr('href'), AnimeShitai.domain);
    },
    getEpisode(url) {
      const episodePart = url.split('/')[6];

      const temp = episodePart.match(/(folge|episode|ep)-\d+/i);

      if (!temp || temp.length === 0) return 1;

      return Number(temp[0].replace(/\D+/g, ''));
    },
    nextEpUrl(url) {
      return utils.absoluteLink(
        j
          .$('div.content div.eright')
          .parent('a')
          .attr('href'),
        AnimeShitai.domain,
      );
    },
  },
  overview: {
    getTitle(url) {
      return j
        .$('div.title > animename')
        .text()
        .replace(/staffel/gi, 'season');
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('#ani > div.body > div.br')
        .first()
        .prepend(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('table.ep_table > tbody > tr');
      },
      elementUrl(selector) {
        return utils.absoluteLink(
          selector.attr('onclick')!.match(/window\.location\.href='(.+?)'/i)![1],
          AnimeShitai.domain,
        );
      },
      elementEp(selector) {
        return AnimeShitai.sync.getEpisode(AnimeShitai.overview!.list!.elementUrl(selector));
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());

    j.$(document).ready(function() {
      page.handlePage();
    });
  },
};
