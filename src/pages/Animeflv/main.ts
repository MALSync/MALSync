import { ConfigurablePage } from '../ConfigurablePage';

export const Animeflv = new ConfigurablePage({
  name: 'Animeflv',
  domainKey: 'animeflv',
  languages: ['Spanish'],
  type: 'anime',

  isSyncPage: { type: 'path', index: 3, value: 'ver' },
  isOverviewPage: { type: 'path', index: 3, value: 'anime' },

  sync: {
    getTitle: { selector: 'h1.Title', match: /(.*) Episodio/ },
    getIdentifier: { selector: '.fa-th-list', attr: 'href' }, // Simplified for POC
    getOverviewUrl: { selector: '.fa-th-list', attr: 'href' },
    getEpisode: { selector: 'h2.SubTitle', match: /Episodio (\d+)/ },
    nextEpUrl: { selector: '.fa-chevron-right', attr: 'href' },
  },

  overview: {
    getTitle: { selector: 'h1.Title' },
    getIdentifier: url => utils.urlPart(url, 4),
    list: {
      elementsSelector: '#episodeList li:not(.Next)',
      elementUrl: { selector: 'a', attr: 'href' },
      elementEp: { selector: 'p', match: /Episodio (\d+)/ },
    },
  },
});

// Override init or specific methods if necessary for complex logic like Captcha checks
// But for standard scraping, the above config should suffice.
