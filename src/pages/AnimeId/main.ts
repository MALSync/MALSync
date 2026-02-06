import { ConfigurablePage } from '../ConfigurablePage';

export const AnimeId = new ConfigurablePage({
  name: 'AnimeId',
  domainKey: 'animeId',
  languages: ['Spanish'],
  type: 'anime',

  isSyncPage: { type: 'path', index: 3, value: 'v' },
  isOverviewPage: { type: 'custom', matchFn: () => j.$('section#capitulos').length > 0 },

  sync: {
    getTitle: { selector: '#infoanime h1 a' },
    getIdentifier: () => {
      const href = j.$('#infoanime h1 a').attr('href');
      return href ? href.split('/').pop() || '' : '';
    },
    getOverviewUrl: { selector: '#infoanime h1 a', attr: 'href' },
    getEpisode: { selector: '#infoanime strong', match: /Capítulo (\d+)/ },
    nextEpUrl: { selector: '.buttons li a:eq(2)', attr: 'href' },
  },

  overview: {
    getTitle: { selector: 'article hgroup h1' },
    getIdentifier: url => utils.urlPart(url, 3),
    list: {
      elementsSelector: 'section#capitulos li a',
      elementUrl: { selector: '', attr: 'href' }, // Selector empty means self
      elementEp: { selector: 'strong', match: /Capítulo (\d+)/ },
    },
  },
});
