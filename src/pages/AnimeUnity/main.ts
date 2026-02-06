import { ConfigurablePage } from '../ConfigurablePage';

export const AnimeUnity = new ConfigurablePage({
  name: 'AnimeUnity',
  domainKey: 'animeUnity',
  languages: ['Italian'],
  type: 'anime',

  isSyncPage: {
    type: 'custom',
    matchFn: url => {
      const parts = url.split('/');
      return parts[4] !== undefined && parts[4].length > 0;
    },
  },
  // Overview was not implemented in original
  isOverviewPage: { type: 'custom', matchFn: () => false },

  sync: {
    // Original: .text().replace('(ITA)', '').trim()
    // We use regex capture to exclude (ITA)
    getTitle: { selector: 'div.general > h1.title', match: /(.*)\s*\(ITA\)/ },
    getIdentifier: url => utils.urlPart(url, 4),
    getOverviewUrl: url => `https://animeunity.it/anime/${utils.urlPart(url, 4)}`,
    getEpisode: { selector: 'div.episode-wrapper > div.episode.episode-item.active' },
    nextEpUrl: { selector: '' }, // Not implemented in original
  },

  overview: {
    getTitle: { selector: '' },
    getIdentifier: () => '',
    list: {
      elementsSelector: '',
      elementUrl: { selector: '' },
      elementEp: { selector: '' },
    },
  },
});
