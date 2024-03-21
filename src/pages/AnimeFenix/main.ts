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
    getOverviewUrl: url => {
      const urlParts = url.split('/');
      if (urlParts[3] === 'ver') {
        urlParts.splice(3, 1);
      }
      urlParts[urlParts.length - 1] = urlParts[urlParts.length - 1].replace(/-\d+(\.\d+)?$/, '');
      return urlParts.join('/');
    },
    getEpisode: url => {
      const urlParts = url.split('/');
      const lastPart = urlParts[urlParts.length - 1].split('?')[0];
      const episodeNumber = lastPart ? lastPart.match(/\d+(\.\d+)?(?= Sub Español|$)/g) : null;
      return episodeNumber && episodeNumber.length > 0 ? parseFloat(episodeNumber[0]) : 0;
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
