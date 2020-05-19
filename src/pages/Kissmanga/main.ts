import { pageInterface } from './../pageInterface';

export const Kissmanga: pageInterface = {
  name: 'kissmanga',
  domain: 'https://kissmanga.com',
  database: 'Kissmanga',
  type: 'manga',
  isSyncPage: function(url) {
    if (typeof utils.urlPart(url, 5) !== 'undefined') {
      return true;
    }
    return false;
  },
  sync: {
    getTitle: function(url) {
      return j
        .$('#navsubbar a')
        .first()
        .text()
        .replace('Manga', '')
        .replace('information', '')
        .trim();
    },
    getIdentifier: function(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl: function(url) {
      return url
        .split('/')
        .slice(0, 5)
        .join('/');
    },
    getEpisode: function(url) {
      let episodePart = utils.urlPart(url, 5);
      let episodeNumber = NaN;
      //var temp = [];
      /*try{
          episodePart = episodePart.replace(j.$('.bigChar').attr('href').split('/')[2],'');
        }catch(e){
          episodePart = episodePart.replace(kalUrl.split("/")[4],'');
        }*/
      let temp = episodePart.match(
        /[c,C][h,H][a,A]?[p,P]?[t,T]?[e,E]?[r,R]?\D?\d+/,
      );
      if (temp === null) {
        episodePart = episodePart.replace(/[V,v][o,O][l,L]\D?\d+/, '');
        temp = episodePart.match(/\d{3}/);
        if (temp === null) {
          temp = episodePart.match(/\d+/);
          if (temp === null) {
            episodeNumber = 0;
          } else {
            episodeNumber = Number(temp[0]);
          }
        } else {
          episodePart = temp[0];
        }
      } else {
        const matches = temp[0].match(/\d+/);

        if (matches && matches.length > 0) episodeNumber = Number(matches[0]);
      }

      return episodeNumber;
    },
    getVolume: function(url) {
      const volumeText = url.match(/[V,v][o,O][l,L]\D?\d{3}/);

      if (!volumeText || volumeText.length === 0) return NaN;

      const volumeNumber = url.match(/\d+/);

      if (!volumeNumber || volumeNumber.length === 0) return NaN;

      return Number(volumeNumber[0].slice(-3));
    },
    nextEpUrl: function(url) {
      return j
        .$('img.btnNext')
        .first()
        .parent()
        .attr('href');
    },
  },
  overview: {
    getTitle: function() {
      return j
        .$('.bigChar')
        .first()
        .text();
    },
    getIdentifier: function(url) {
      return Kissmanga.sync.getIdentifier(url);
    },
    uiSelector: function(selector) {
      selector.insertAfter(j.$('.bigChar').first());
    },
    list: {
      offsetHandler: true,
      elementsSelector: function() {
        return j.$('.listing tr');
      },
      elementUrl: function(selector) {
        return utils.absoluteLink(
          selector
            .find('a')
            .first()
            .attr('href'),
          Kissmanga.domain,
        );
      },
      elementEp: function(selector) {
        const url = Kissmanga.overview!.list!.elementUrl(selector);
        if (/_ED/.test(url)) return NaN;
        return Kissmanga.sync.getEpisode(url);
      },
    },
  },
  init(page) {
    if (document.title === 'Just a moment...') {
      con.log('loading');
      page.cdn();
      return;
    }
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(document).ready(function() {
      page.handlePage();
    });
  },
};
