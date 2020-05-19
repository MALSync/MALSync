import { pageInterface } from './../pageInterface';

export const AnimeZone: pageInterface = {
  name: 'AnimeZone',
  domain: 'https://www.animezone.pl',
  type: 'anime',
  isSyncPage: function(url) {
    return url.split('/')[5] !== undefined;
  },
  sync: {
    getTitle: function(url) {
      return j.$('.category-description .panel-title').attr('title') || '';
    },
    getIdentifier: function(url) {
      return url.split('/')[4];
    },
    getOverviewUrl: function(url) {
      return utils.absoluteLink(
        j.$('.all-episodes > a').attr('href'),
        AnimeZone.domain,
      );
    },
    getEpisode: function(url) {
      return Number(url.split('/')[5]);
    },
    nextEpUrl: function(url) {
      const href = j.$('.next a').attr('href');
      if (href) return utils.absoluteLink(href, AnimeZone.domain);
    },
  },
  overview: {
    getTitle: function(url) {
      return j.$('.category-description .panel-title').attr('title') || '';
    },
    getIdentifier: function(url) {
      return url.split('/')[4];
    },
    uiSelector: function(selector) {
      selector.insertAfter(j.$('.ratings .panel-body .description').first());
    },
    list: {
      offsetHandler: false,
      elementsSelector: function() {
        return j.$('table.episodes > tbody > tr');
      },
      elementUrl: function(selector) {
        const anchorHref = selector
          .find('td:nth-child(6) > a')
          .first()
          .attr('href');

        if (!anchorHref) return;

        return utils.absoluteLink(
          anchorHref.replace(/^../gm, ''),
          AnimeZone.domain,
        );
      },
      elementEp: function(selector) {
        return selector
          .find('td:nth-child(6) > a')
          .first()
          .attr('href')
          .split('/')[3]
          .replace(/\D+/, '');
      },
    },
  },

  init(page) {
    if (document.title == 'Just a moment...') {
      con.log('loading');
      page.cdn();
      return;
    }
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(document).ready(function() {
      page.handlePage();

      const target = j.$('#episode')[0];
      const config = { attributes: false, childList: true, subtree: true };

      const callback = function(
        mutationsList: MutationRecord[],
        observer: MutationObserver,
      ) {
        for (const mutation of mutationsList) {
          if (mutation.type !== 'childList') return;

          const srcElement:
            | HTMLAnchorElement
            | HTMLFrameElement
            | null = document.querySelector('#episode a,  #episode iframe');

          if (!srcElement) return;

          const url =
            srcElement instanceof HTMLAnchorElement
              ? srcElement.href
              : srcElement.src;
          const src = url.replace(/^http:\/\//i, 'https://');

          const embedContainer = document.querySelector(
            '#episode .embed-container',
          );

          if (!embedContainer) return;

          embedContainer.innerHTML = '';

          const iframe = document.createElement('iframe');
          iframe.src = src;
          iframe.width = '100%';
          iframe.height = '100%';

          iframe.setAttribute('allowfullscreen', 'true');
          embedContainer.append(iframe);
          observer.disconnect();
        }
      };

      const observer = new MutationObserver(callback);

      j.$('.btn.btn-xs.btn-success').each(function(i, e) {
        j.$(e).click(function() {
          observer.observe(target, config);
        });
      });
    });
  },
};
