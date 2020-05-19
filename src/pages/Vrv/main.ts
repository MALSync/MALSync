import { pageInterface } from './../pageInterface';

let json: any = undefined;
let ident: any = undefined;

let seasonInterval: number;

function getSeries(page, overview = '') {
  json = undefined;
  ident = undefined;
  api.request.xhr('GET', page.url).then(response => {
    con.log(response);
    json = JSON.parse(
      `{${
        response.responseText.split('__INITIAL_STATE__ = {')[1].split('};')[0]
      }}`,
    );
    con.log(json);

    if (overview.length) {
      json.seriesPage.seasons.forEach(function(element) {
        if (overview.indexOf(element.json.title) !== -1) {
          con.log('Season Found', element);
          ident = element;
        }
      });
    } else {
      if (json.seriesPage.seasons.length) {
        con.log('Season', json.seriesPage.seasons[0]);
        ident = json.seriesPage.seasons[0];
      }
    }

    page.handlePage();
  });
}

export const Vrv: pageInterface = {
  name: 'Vrv',
  domain: 'https://vrv.co',
  type: 'anime',
  isSyncPage: function(url) {
    if (utils.urlPart(window.location.href, 3) == 'series') return false;
    return true;
  },
  sync: {
    getTitle: function(url) {
      return `${
        json.watch.mediaResource.json.series_title
      } - ${json.watch.mediaResource.json.season_title.replace(
        json.watch.mediaResource.json.series_title,
        '',
      )}`;
    },
    getIdentifier: function(url) {
      return json.watch.mediaResource.json.season_id;
    },
    getOverviewUrl: function(url) {
      return `${Vrv.domain}/series/${
        json.watch.mediaResource.json.series_id
      }?season=${Vrv.sync.getIdentifier(url)}`;
    },
    getEpisode: function(url) {
      return json.watch.mediaResource.json.episode_number;
    },
    nextEpUrl: function(url) {
      if (typeof json.watch.mediaResource.json.next_episode_id === 'undefined')
        return '';
      return `${Vrv.domain}/watch/${json.watch.mediaResource.json.next_episode_id}`;
    },
  },
  overview: {
    getTitle: function(url) {
      return `${json.seriesPage.series.json.title} - ${ident.json.title.replace(
        json.seriesPage.series.json.title,
        '',
      )}`;
    },
    getIdentifier: function(url) {
      return ident.json.id;
    },
    uiSelector: function(selector) {
      selector.insertAfter($('.erc-series-info .series-title').first());
    },
    list: {
      offsetHandler: true,
      elementsSelector: function() {
        return j.$('.erc-series-media-list-element');
      },
      elementUrl: function(selector) {
        return utils.absoluteLink(
          selector
            .find('a')
            .first()
            .attr('href'),
          Vrv.domain,
        );
      },
      elementEp: function(selector) {
        const epInfo = selector
          .find('.episode-title')
          .text()
          .trim();
        const temp = epInfo.match(/^E\d+/i);

        if (!temp) return NaN;

        return Number(temp[0].replace('E', ''));
      },
      getTotal: function() {
        throw 'Not supported';
        return 0;
      },
    },
  },
  init(page) {
    function ready() {
      clearInterval(seasonInterval);
      $('#flashinfo-div, #flash-div-bottom, #flash-div-top, #malp').remove();
      page.UILoaded = false;
      if (utils.urlPart(window.location.href, 3) == 'watch') {
        getSeries(page);
      }
      if (utils.urlPart(window.location.href, 3) == 'series') {
        utils.waitUntilTrue(
          function() {
            return j.$('.erc-series-info .series-title').first().length;
          },
          function() {
            if (
              !j.$('.erc-series-media-list-element').length ||
              typeof j
                .$('.erc-series-media-list-element a')
                .first()
                .attr('href') !== 'undefined'
            ) {
              getSeries(
                page,
                $('.controls-select-trigger .season-info')
                  .text()
                  .trim(),
              );
            }
            seasonInterval = utils.changeDetect(
              function() {
                $(
                  '#flashinfo-div, #flash-div-bottom, #flash-div-top, #malp',
                ).remove();
                page.UILoaded = false;
                getSeries(
                  page,
                  $('.controls-select-trigger .season-info')
                    .text()
                    .trim(),
                );
              },
              function() {
                return j
                  .$('.erc-series-media-list-element a')
                  .first()
                  .attr('href');
              },
            );
          },
        );
      }
    }

    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(document).ready(function() {
      ready();
    });
    utils.urlChangeDetect(function() {
      page.url = window.location.href;
      ready();
    });
  },
};
