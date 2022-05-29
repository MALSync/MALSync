import { pageInterface } from '../pageInterface';

export const Aniworld: pageInterface = {
  domain: 'https://aniworld.to',
  languages: ['German'],
  name: 'Aniworld',
  type: 'anime',
  isSyncPage(url: string): boolean {
    return (
      typeof url.split('/')[4] !== 'undefined' &&
      url.split('/')[4] === 'stream' &&
      typeof url.split('/')[7] !== 'undefined' &&
      (url.split('/')[7].startsWith('episode') || url.split('/')[7].startsWith('film'))
    );
  },
  isOverviewPage(url: string) {
    return (
      typeof url.split('/')[4] !== 'undefined' &&
      url.split('/')[4] === 'stream' &&
      typeof url.split('/')[7] === 'undefined' &&
      url.split('/')[6] !== 'filme'
    );
  },
  sync: {
    getTitle(url: string): string {
      return getTitle(url);
    },
    getIdentifier(url: string): string {
      return getIdentifier(url);
    },
    getOverviewUrl(url: string): string {
      return j.$('ul.breadCrumbMenu > li').eq(2).find('a').attr('href') || '';
    },
    getEpisode(url: string): number {
      return Number(url.split('/')[7].split('-')[1].split('#')[0]);
    },
    uiSelector(selector) {
      j.$('div.hosterSiteDirectNav').before(j.html(selector));
    },
  },
  overview: {
    getTitle(url) {
      return getTitle(url);
    },
    getIdentifier(url) {
      return getIdentifier(url);
    },
    uiSelector(selector) {
      j.$('div.hosterSiteDirectNav').before(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('div.hosterSiteDirectNav > ul:eq(1) > li > a');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.attr('href'), Aniworld.domain);
      },
      elementEp(selector) {
        return parseInt(selector.text());
      },
    },
  },
  init(page): void {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(() => {
      page.handlePage();
    });
  },
};

function getTitle(url: string): string {
  const urlParts = url.split('/');

  if (typeof urlParts[6] === 'undefined' || urlParts[6].startsWith('staffel-1')) {
    return j.$('div.series-title > h1 > span').text();
  }

  if (urlParts[6] === 'filme') {
    return j
      .$('div.hosterSiteTitle > h2 > small.episodeEnglishTitle')
      .text()
      .replace(/\[[A-Za-z\0-9]+\]/gm, '')
      .trim();
  }

  return `${j.$('div.series-title > h1 > span').text()} season ${urlParts[6]
    .split('#')
    .shift()
    ?.split('-')
    .pop()}`;
}

function getIdentifier(url: string): string {
  const urlParts = url.split('/');
  const name = urlParts[5];

  if (urlParts[6] === 'filme') {
    return `${name}?m=${getTitle(url).split(' ').join('-').toLowerCase()}`;
  }

  const season = typeof urlParts[6] === 'undefined' ? 'staffel-1' : urlParts[6].split('#')[0];
  return `${name}?s=${season}`;
}
