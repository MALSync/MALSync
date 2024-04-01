import { pageInterface } from '../pageInterface';

export const AnimeFenix: pageInterface = {
  name: 'AnimeFenix',
  domain: 'https://animefenix.tv',
  languages: ['Spanish'],
  type: 'anime',
  isSyncPage: url => {
    const path = url.split('/')[3];
    return path === 'ver';
  },
  sync: {
    getTitle: url => {
      const titleElement = document.querySelector('.hero h1');
      let title = titleElement?.textContent ? titleElement.textContent.trim() : null;

      if (!title) {
        const urlTitle = url.split('/')[4];
        title = urlTitle ? urlTitle.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : '';
      }
      title = title.replace(/\d+(\.\d+)? Sub Español$/, '').trim();
      return title;
    },
    getIdentifier: url => {
      return AnimeFenix.sync.getTitle(url);
    },
    getOverviewUrl: (url: string) => {
      const getEpisode = (url: string) => {
        const lastPart = url.split('/').pop()?.split('?')[0];
        const episodeNumber = lastPart ? lastPart.match(/\d+(\.\d+)?(?= Sub Español|$)/g) : null;
        return episodeNumber && episodeNumber.length > 0 ? parseFloat(episodeNumber[0]) : 0;
      };
      return getEpisode(url).toString();
    },
    getEpisode: () => {
      const titleElement = document.querySelector("body > div.hero > section > div.columns.is-multiline > div > div > h1");
      const title = titleElement?.textContent ? titleElement.textContent.trim() : '';

      let episodeNumber = 0;
      const subEspañolMatch = title.match(/\d+(\.\d+)?(?= Sub Español|$)/g);
      const latinoMatch = title.match(/\d+(\.\d+)?(?= Latino|$)/g);

      if (subEspañolMatch && subEspañolMatch.length > 0) {
        episodeNumber = parseFloat(subEspañolMatch[0]);
      } else if (latinoMatch && latinoMatch.length > 0) {
        episodeNumber = parseFloat(latinoMatch[0]);
      }

      return episodeNumber;
    },
  },
  init: page => {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(document).ready(function () {
      const h1Element = document.querySelector('h1');
      if (
        h1Element &&
        h1Element.textContent &&
        h1Element.textContent.includes('Animes Populares')
      ) {
        console.error('404');
        return;
      }
      if (page.url.split('/')[3] === 'ver') {
        page.handlePage();
      }
    });
  },
};
