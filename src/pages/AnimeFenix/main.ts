import { pageInterface } from '../pageInterface';

export const AnimeFenix: pageInterface = {
  name: 'AnimeFenix',
  domain: 'https://animefenix.tv',
  languages: ['Spanish'],
  type: 'anime',
  isSyncPage: (url: string) => {
    if (url.split('/')[3] === 'ver') {
      return true;
    }
    return false;
  },
  isOverviewPage: (url: string) => {
    let path = url.split('/')[3];
    if (path && path !== 'ver' && path !== 'zerotwo') {
      return true;
    }
    return false;
  },
  sync: {
    getTitle: (url: string) => {
      let titleElement = document.querySelector("body > div.hero.is-fullheightX > section > div > div > div.column.is-12-mobile.is-8-tablet.is-9-desktop > h1");
      let title = titleElement?.textContent ? titleElement.textContent.replace(/\d+\s*(Sub|Dub|Doblaje|Español)$/i, '').trim() : null;
      
      if (!title) {
        let urlTitle = url.split('/')[4];
        title = urlTitle ? urlTitle.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : '';
      }
      return title.split(' (')[0];
    },
    getIdentifier: (url: string) => {
      let titleElement = document.querySelector("body > div.hero.is-fullheightX > section > div > div > div.column.is-12-mobile.is-8-tablet.is-9-desktop > h1");
      let identifier = titleElement?.textContent ? titleElement.textContent.replace(/\d+\s*(Sub|Dub|Doblaje|Español)$/i, '').trim() : null;
      
      if (!identifier) {
        let urlTitle = url.split('/')[4];
        identifier = urlTitle ? urlTitle.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : '';
      }
      return identifier.split(' (')[0];
    },          
    getOverviewUrl: (url: string) => {
      let urlParts = url.split('/');
      if (urlParts[3] === 'ver') {
        urlParts.splice(3, 1); // Remove 'ver'
      }
      return urlParts.join('/');
    },
    getEpisode: (url: string) => {
      let urlParts = url.split('/');
      let lastPart = urlParts.pop();
      let episodeNumber = lastPart ? lastPart.match(/\d+/g) : null;
      return episodeNumber && episodeNumber.length > 0 ? parseInt(episodeNumber[episodeNumber.length - 1]) : 0;
    },
  },
  init: (page) => {
    j.$(document).ready(function () {
      let h1Element = document.querySelector('h1');
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

export interface pageState {
  on: 'SYNC' | 'OVERVIEW';
  title: string;
  identifier: string;
  episode?: number;
  detectedEpisode?: number;
}
