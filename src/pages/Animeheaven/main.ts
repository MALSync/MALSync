import { pageInterface } from '../pageInterface';

export const Animeheaven: pageInterface = {
  name: 'Animeheaven',
  domain: 'http://animeheaven.eu',
  database: 'Animeheaven',
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    if (utils.urlPart(url, 3) === 'watch.php') {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return Animeheaven.sync.getIdentifier(url);
    },
    getIdentifier(url) {
      return utils.urlParam(url, 'a') || '';
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(
        j
          .$('a.infoan2')
          .first()
          .attr('href'),
        Animeheaven.domain,
      );
    },
    getEpisode(url) {
      return Number(utils.urlParam(url, 'e'));
    },
    nextEpUrl(url) {
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
    getTitle(url) {
      return Animeheaven.sync.getIdentifier(url);
    },
    getIdentifier(url) {
      return Animeheaven.sync.getIdentifier(url);
    },
    uiSelector(selector) {
      j.$('.infoepboxmain')
        .first()
        .before(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('.infoepbox > a');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.attr('href'), Animeheaven.domain);
      },
      elementEp(selector) {
        const url = Animeheaven.overview!.list!.elementUrl(selector);
        return Animeheaven.sync.getEpisode(url);
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
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
