import { createApp } from '../utils/Vue';
import { Single as SimklSingle } from '../_provider/Simkl/single';
import * as helper from '../provider/Simkl/helper';
import malkiss from './malkiss.vue';
import { activeLinks } from '../utils/quicklinksBuilder';
import { waitForPageToBeVisible } from '../utils/general';

export class SimklClass {
  page: any = null;

  private interval;

  private interval2;

  private malkiss;

  constructor(public url: string) {
    utils.urlChangeDetect(() => {
      clearInterval(this.interval);
      this.interval = utils.waitUntilTrue(
        function () {
          return (
            (!$('#global_div').length || parseInt($('#global_div').css('opacity')) === 1) &&
            (!$('#tvMainTable').length || parseInt($('#tvMainTable').css('opacity')) === 1)
          );
        },
        () => {
          this.url = window.location.href;
          this.init();
        },
        1000,
      );
    });

    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    $(document).ready(() => {
      this.init();
    });
  }

  async init() {
    await waitForPageToBeVisible();
    con.log(this.url);

    clearInterval(this.interval2);

    if (this.url.indexOf('apps/chrome/mal-sync') > -1) {
      this.authentication();
    }

    const urlpart = utils.urlPart(this.url, 3);
    const url2part = utils.urlPart(this.url, 4);

    if ((urlpart === 'anime' || urlpart === 'manga') && !Number.isNaN(Number(url2part))) {
      const malObj = new SimklSingle(this.url);
      await malObj.update();

      this.page = {
        page: 'detail',
        id: malObj.getIds().simkl,
        malid: malObj.getIds().mal,
        type: urlpart,
        malObj,
      };
      con.log('page', this.page);

      if (!$('#malkiss').length)
        $('.SimklTVAboutBlockTitle, .simkltvdetailmobilesummaryinfo').after(
          j.html('<div id="malkiss"></div>'),
        );
      if (this.malkiss) this.malkiss.$.appContext.app.unmount();
      this.malkiss = createApp(malkiss, '#malkiss');

      this.streamingUI();
      this.malToKiss();
      this.pageRelation();
    }
  }

  async getMalUrl() {
    const urlpart = utils.urlPart(this.url, 3);
    if (urlpart === 'anime' || urlpart === 'manga') {
      const simklId = utils.urlPart(this.url, 4);
      return helper.simklIdToMal(simklId).then(malId => {
        if (!malId) return '';
        return `https://myanimelist.net/${urlpart}/${malId}/${utils.urlPart(this.url, 5)}`;
      });
    }
    return '';
  }

  authentication() {
    try {
      utils.checkDoubleExecution();
    } catch (e) {
      con.error(e);
    }
    try {
      const code = utils.urlParam(this.url, 'code');
      if (!code) throw 'No code found!';
      helper
        .call(
          'https://api.simkl.com/oauth/token',
          JSON.stringify({
            code,
            client_id: helper.client_id,
            client_secret: '3f883e8e6cdd60d2d5e765aaf0612953f743dc77f44c422af98b38e083cf038b',
            redirect_uri: 'https://simkl.com/apps/chrome/mal-sync/connected/',
            grant_type: 'authorization_code',
          }),
          false,
          'POST',
        )
        .then(access_token => {
          if (
            typeof access_token.error !== 'undefined' ||
            typeof access_token.access_token === 'undefined'
          )
            throw access_token;
          return api.settings.set('simklToken', access_token.access_token);
        })
        .then(access_token => {
          $('.firstStage').addClass('HideImportant');
          $('.secondStage').removeClass('HideImportant');
          $('.secondStage .SimklTVKodiheaddesc').css('text-align', 'center');
        })
        .catch(e => {
          ee(e);
        });
    } catch (e) {
      ee(e);
    }

    function ee(e) {
      con.error(e);
      $('.firstStage .SimklTVKodititletext, .secondStage .SimklTVKodititletext').text(
        'Something went wrong',
      );
    }
  }

  async streamingUI() {
    con.log('Streaming UI');

    const { malObj } = this.page;

    const streamUrl = malObj.getStreamingUrl();
    if (typeof streamUrl !== 'undefined') {
      this.malkiss.streamUrl = streamUrl;

      const resumeUrlObj = malObj.getResumeWatching();
      const continueUrlObj = malObj.getContinueWatching();
      con.log('Resume', resumeUrlObj, 'Continue', continueUrlObj);
      if (continueUrlObj && continueUrlObj.ep === malObj.getEpisode() + 1) {
        this.malkiss.continueUrl = continueUrlObj.url;
      } else if (resumeUrlObj && resumeUrlObj.ep === malObj.getEpisode()) {
        this.malkiss.resumeUrl = resumeUrlObj.url;
      }
    } else {
      this.malkiss.streamUrl = null;
    }
  }

  getImage() {
    return $('#detailPosterImg').attr('src');
  }

  getTitle() {
    return $('h1').first().text().trim() || '';
  }

  malToKiss() {
    con.log('malToKiss');

    const title = this.getTitle();

    activeLinks(this.page!.type, this.page!.malid, title).then(links => {
      this.malkiss.links = links;
    });
  }

  async pageRelation() {
    await this.page.malObj.fillRelations();
    this.malkiss.pageRelation = this.page.malObj.getPageRelations();
  }
}
