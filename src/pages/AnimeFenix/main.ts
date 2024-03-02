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
  isOverviewPage: (url: string) => {
    const path = url.split('/')[3];
    return Boolean(path && path !== 'ver' && path !== 'zerotwo');
  },  
  sync: {
    getTitle: (url: string) => {
      const titleElement = document.querySelector(".hero h1");
      let title = titleElement?.textContent
        ? titleElement.textContent.replace(/\d+\s*(Sub|Dub|Doblaje|Español)$/i, '').trim()
        : null;
    
      if (!title) {
        const urlTitle = url.split('/')[4];
        title = urlTitle ? urlTitle.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : '';
      }
      return title.replace(/\d+ Sub Español$/, '').trim();
    },
    getIdentifier: (url: string) => {
      return AnimeFenix.sync.getTitle(url);
    },          
    getOverviewUrl: (url: string) => {
      const urlParts = url.split('/');
      if (urlParts[3] === 'ver') {
        urlParts.splice(3, 1);
      }
      return urlParts.join('/');
    },
    getEpisode: (url: string) => {
      const urlParts = url.split('/');
      const lastPart = urlParts.pop();
      const episodeNumber = lastPart ? lastPart.match(/\d+/g) : null;
      return episodeNumber && episodeNumber.length > 0 ? parseInt(episodeNumber[episodeNumber.length - 1]) : 0;
    },
  },
  overview: {
    getTitle: (url: string) => {
      const titleElement = document.querySelector(".hero h1");
      let title = titleElement?.textContent
        ? titleElement.textContent.replace(/\d+\s*(Sub|Dub|Doblaje|Español)$/i, '').trim()
        : null;
  
      if (!title) {
        const urlTitle = url.split('/')[4];
        title = urlTitle ? urlTitle.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : '';
      }
      return title.split(' (')[0];
    },
    getIdentifier: (url: string) => {
      const identifier = AnimeFenix.overview?.getTitle(url);
      return identifier || '';
    },
    uiSelector: function(selector) {
      j.$('.anime-page__episode-list.is-size-6').first().before(j.html(selector));
    },    
    list: {
      offsetHandler: false,
      elementsSelector: function() {
        return j.$('.anime-page__episode-list.is-size-6 li a');
      },      
      elementUrl: function(selector) {
        return j.$(selector).find('a').first().attr('href') || '';
      },
      elementEp: function(selector) {
        const url = this.elementUrl(selector);
        return AnimeFenix.sync.getEpisode(url);
      },          
    },
  },
  init: page => {
    j.$(document).ready(function () {
      const h1Element = document.querySelector('h1');
      if (h1Element && h1Element.textContent && h1Element.textContent.includes('Animes Populares')) {
        console.error('404');
        return;
      }
      if (page.url.split('/')[3] === 'ver' || page.url.split('/')[3] !== 'zerotwo') {
        page.handlePage();
      }
    });
  },  
};
