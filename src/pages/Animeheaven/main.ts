import { pageInterface } from './../pageInterface';

export const Animeheaven: pageInterface = {
  name: 'Animeheaven',
  domain: 'http://animeheaven.eu',
  database: 'Animeheaven',
  type: 'anime',
  isSyncPage: function(url) {
    if (utils.urlPart(url, 3) === 'watch.php') {
      return true;
    }
    return false;
  },
  sync: {
    getTitle: function(url) {
      return Animeheaven.sync.getIdentifier(url);
    },
    getIdentifier: function(url) {
      return utils.urlParam(url, 'a') || '';
    },
    getOverviewUrl: function(url) {
      return utils.absoluteLink(
        j
          .$('a.infoan2')
          .first()
          .attr('href'),
        Animeheaven.domain,
      );
    },
    getEpisode: function(url) {
      return Number(utils.urlParam(url, 'e'));
    },
    nextEpUrl: function(url) {
      return utils.absoluteLink(
        j
          .$('.next2')
          .first()
          .parent()
          .attr('href'),
        Animeheaven.domain,
      );
    },
  },
  overview: {
    getTitle: function(url) {
      return Animeheaven.sync.getIdentifier(url);
    },
    getIdentifier: function(url) {
      return Animeheaven.sync.getIdentifier(url);
    },
    uiSelector: function(selector) {
      selector.insertBefore(j.$('.infoepboxmain').first());
    },
    list: {
      offsetHandler: false,
      elementsSelector: function() {
        return j.$('.infoepbox > a');
      },
      elementUrl: function(selector) {
        return utils.absoluteLink(selector.attr('href'), Animeheaven.domain);
      },
      elementEp: function(selector) {
        const url = Animeheaven.overview!.list!.elementUrl(selector);
        return Animeheaven.sync.getEpisode(url);
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(document).ready(function() {
      page.handlePage();
      setDesign();
      $('#bbox').click(function() {
        setDesign();
      });
    });

    function setDesign() {
      if ($('#bwsel').hasClass('bwselect2')) {
        $('body').addClass('white');
      } else {
        $('body').removeClass('white');
      }
    }
  },
};
