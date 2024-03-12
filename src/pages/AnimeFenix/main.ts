import { pageInterface } from '../pageInterface';

export const AnimeFenix: pageInterface = {
  name: 'AnimeFenix',
  domain: 'https://animefenix.tv',
  languages: ['Spanish'],
  type: 'anime',
  isSyncPage: (url: string) => {
    const path = url.split('/')[3];
    return path === 'ver';
  },
  sync: {
    getTitle: (url: string) => {
      const titleElement = document.querySelector('.hero h1');
      let title = titleElement?.textContent ? titleElement.textContent.trim() : null;
    
      if (!title) {
        const urlTitle = url.split('/')[4];
        title = urlTitle ? urlTitle.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : '';
      }
      // Remove episode number from the title
      const titleParts = title.split(' ');
      if (titleParts.length > 1 && !isNaN(Number(titleParts[titleParts.length - 1]))) {
        titleParts.pop();
        title = titleParts.join(' ');
      }
      return title;
    },    
    getIdentifier: (url: string) => {
      return AnimeFenix.sync.getTitle(url);
    },
    getOverviewUrl: (url: string) => {
      const urlParts = url.split('/');
      if (urlParts[3] === 'ver') {
        urlParts.splice(3, 1);
      }
      urlParts[urlParts.length - 1] = urlParts[urlParts.length - 1].replace(/-\d+$/, '');
      return urlParts.join('/');
    },    
    getEpisode: (url: string) => {
      const urlParts = url.split('/');
      const lastPart = urlParts.pop();
      const episodeNumber = lastPart ? lastPart.match(/\d+/g) : null;
      return episodeNumber && episodeNumber.length > 0
        ? parseInt(episodeNumber[episodeNumber.length - 1])
        : 0;
    },
  },
  init: (page) => {
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
      if (
        page.url.split('/')[3] === 'ver'
      ) {
        page.handlePage();
      }
    });
  },
};
