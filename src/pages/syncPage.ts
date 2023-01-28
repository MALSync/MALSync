import { pageInterface, pageState } from './pageInterface';
import { getSingle } from '../_provider/singleFactory';
import { hideFloatbutton, initFloatButton, showFloatbutton } from '../floatbutton/init';
import { providerTemplates } from '../provider/templates';
import { fullscreenNotification, getPlayerTime } from '../utils/player';
import { SearchClass } from '../_provider/Search/vueSearchClass';
import { emitter } from '../utils/emitter';
import { Cache } from '../utils/Cache';
import { isIframeUrl } from '../utils/manifest';
import { bloodTrail, Shark } from '../utils/shark';
import { MissingDataError, MissingPlayerError } from '../utils/errors';
import { NotFoundError, UrlNotSupportedError } from '../_provider/Errors';
import { hasMissingPermissions } from '../utils/customDomains';
import { localStore } from '../utils/localStore';
import { MangaProgress } from '../utils/mangaProgress/MangaProgress';

declare let browser: any;

let extensionId = 'agnaejlkbiiggajjmnpmeheigkflbnoo'; // Chrome
if (typeof browser !== 'undefined' && typeof chrome !== 'undefined') {
  extensionId = '{57081fef-67b4-482f-bcb0-69296e63ec4f}'; // Firefox
}

const logger = con.m('Sync', '#348fff');

let browsingTimeout;

let playerTimeout;

export class SyncPage {
  page: pageInterface;

  searchObj;

  singleObj;

  mangaProgress: MangaProgress | undefined;

  public novel = false;

  public strongVolumes = false;

  public videoSyncOffset = true;

  public videoSyncInterval;

  constructor(
    public url,
    public pages,
    protected floatClick: any = () => {
      throw 'No click handling found';
    },
  ) {
    this.page = this.getPage(url);
    if (this.page === null) {
      throw new Error('Page could not be recognized');
    }
    this.domainSet();
    logger.log('Page', this.page.name);
    if (
      !(
        typeof api.settings.get('enablePages')[this.page.name] === 'undefined' ||
        api.settings.get('enablePages')[this.page.name]
      )
    ) {
      logger.info('Sync is disabled for this page', this.page.name);
      throw 'Stop Script';
    }

    if (this.page.type === 'manga' && api.settings.get('readerTracking')) {
      this.mangaProgress = new MangaProgress(this.page.sync.readerConfig || [], this.page.name);
    }

    emitter.on('syncPage_fillUi', () => this.fillUI());
  }

  init() {
    const This = this;
    j.$(document).ready(function () {
      initFloatButton(This, This.floatClick);
    });

    if (this.testForCloudflare()) {
      logger.log('loading');
      this.cdn();
      return;
    }

    this.page.init(this);

    if (api.type === 'webextension') {
      // Discord Presence
      try {
        chrome.runtime.onMessage.addListener((info, sender, sendResponse) => {
          this.presence(info, sender, sendResponse);
        });
      } catch (e) {
        logger.error(e);
      }
    }
  }

  private getPage(url) {
    if (this.pages.type) return this.pages;
    for (const key in this.pages) {
      const page = this.pages[key];
      if (j.$.isArray(page.domain)) {
        let resPage;
        page.domain.forEach(singleDomain => {
          if (checkDomain(singleDomain)) {
            page.domain = singleDomain;
            resPage = page;
          }
        });
        if (resPage) return resPage;
      } else if (checkDomain(page.domain)) {
        return page;
      }

      function checkDomain(domain) {
        if (
          url.indexOf(
            `${utils.urlPart(domain, 2).replace('.com.br', '.br').split('.').slice(-2, -1)[0]}.`,
          ) > -1
        ) {
          return true;
        }
        return false;
      }
    }
    return null;
  }

  private domainSet() {
    this.page.domain = new URL(window.location.href).origin;
  }

  public openNextEp() {
    if (typeof this.page.sync.nextEpUrl !== 'undefined') {
      if (this.page.isSyncPage(this.url)) {
        const nextEp = this.page.sync.nextEpUrl(this.url);
        if (nextEp) {
          window.location.href = nextEp;
          return;
        }
      }
      utils.flashm(api.storage.lang('nextEpShort_no_nextEp'), {
        error: true,
        type: 'EpError',
      });
      return;
    }
    utils.flashm(api.storage.lang('nextEpShort_no_support'), {
      error: true,
      type: 'EpError',
    });
  }

  public setVideoTime(item, timeCb) {
    this.resetPlayerError();
    const syncDuration = api.settings.get('videoDuration');
    const progress = (item.current / (item.duration * (syncDuration / 100))) * 100;
    if (j.$('#malSyncProgress').length) {
      if (progress < 100) {
        j.$('.ms-progress').css('width', `${progress}%`);
        j.$('#malSyncProgress').removeClass('ms-loading').removeClass('ms-done');
      } else if (this.videoSyncOffset) {
        j.$('#malSyncProgress').addClass('ms-done');
        j.$('.flash.type-update .sync').click();
      } else {
        con.log('videoSyncOffset', progress);
      }
    }
    this.handleVideoResume(item, timeCb);
    this.autoNextEp(item);
  }

  autoNextEpRun = false;

  public autoNextEp(item) {
    if (api.settings.get('autoNextEp') && !this.autoNextEpRun && item.current + 1 > item.duration) {
      this.autoNextEpRun = true;
      this.openNextEp();
    }
  }

  private handleVideoResume(item, timeCb) {
    if (
      typeof this.curState === 'undefined' ||
      typeof this.curState.identifier === 'undefined' ||
      typeof this.curState.episode === 'undefined'
    )
      return;
    const This = this;
    const localSelector = `${this.curState.identifier}/${this.curState.episode}`;

    this.curState.lastVideoTime = item;

    // @ts-ignore
    if (typeof this.curState.videoChecked !== 'undefined' && this.curState.videoChecked) {
      if (this.curState.videoChecked > 1 && item.current > 10) {
        logger.debug('Set Resume', item.current);
        localStore.setItem(localSelector, item.current);
        this.curState.videoChecked = true;
        setTimeout(() => {
          if (this.curState) this.curState.videoChecked = 2;
        }, 10000);
      }
    } else {
      const localItem = localStore.getItem(localSelector);
      logger.info('Resume', localItem);
      if (
        localItem !== null &&
        parseInt(localItem) - 30 > item.current &&
        parseInt(localItem) > 30
      ) {
        if (!j.$('#MALSyncResume').length) j.$('#MALSyncResume').parent().parent().remove();
        const resumeTime = Math.round(parseInt(localItem));
        let resumeTimeString = '';

        if (api.settings.get('autoresume')) {
          // Dont autoresume if near the end of the video
          if (item.duration - resumeTime > item.duration * 0.1) {
            timeCb(resumeTime);
            This.curState.videoChecked = 2;
            return;
          }
        }
        let delta = resumeTime;
        const minutes = Math.floor(delta / 60);
        delta -= minutes * 60;
        let sec = `${delta}`;
        while (sec.length < 2) sec = `0${sec}`;
        resumeTimeString = `${minutes}:${sec}`;

        const resumeMsg = utils.flashm(
          `<button id="MALSyncResume" class="sync" style="margin-bottom: 2px; background-color: transparent; border: none; color: rgb(255,64,129);cursor: pointer;">${api.storage.lang(
            'syncPage_flashm_resumeMsg',
            [resumeTimeString],
          )}</button><br><button class="resumeClose" style="background-color: transparent; border: none; color: white;margin-top: 10px;cursor: pointer;">Close</button>`,
          {
            permanent: true,
            error: false,
            type: 'resume',
            minimized: false,
            position: 'top',
          },
        );

        resumeMsg.find('.sync').on('click', function () {
          timeCb(resumeTime);
          This.curState.videoChecked = 2;
          // @ts-ignore
          j.$(this).parent().parent().remove();
        });

        resumeMsg.find('.resumeClose').on('click', function () {
          This.curState.videoChecked = 2;
          // @ts-ignore
          j.$(this).parent().parent().remove();
        });
      } else {
        setTimeout(() => {
          this.curState.videoChecked = 2;
        }, 15000);
      }

      // @ts-ignore
      this.curState.videoChecked = true;
    }
  }

  curState: any = undefined;

  tempPlayer: any = undefined;

  reset() {
    this.url = window.location.href;
    this.UILoaded = false;
    this.curState = undefined;
    this.setSearchObj(undefined);
    if (this.mangaProgress) this.mangaProgress.stop();
    $('#flashinfo-div, #flash-div-bottom, #flash-div-top, #malp').remove();
  }

  setSearchObj(searchObj) {
    if (searchObj) {
      showFloatbutton();
    } else if (api.settings.get('floatButtonCorrection')) {
      hideFloatbutton();
    }
    this.searchObj = searchObj;
  }

  async handlePage(curUrl = window.location.href) {
    this.resetPlayerError();
    let state: pageState;
    this.curState = undefined;
    this.setSearchObj(undefined);
    this.url = curUrl;
    this.browsingtime = Date.now();
    let tempSingle;

    this.videoSyncOffset = false;
    clearTimeout(this.videoSyncInterval);
    this.videoSyncInterval = setTimeout(() => {
      this.videoSyncOffset = true;
    }, 10000);

    if (this.page.isSyncPage(this.url)) {
      this.loadUI();
      state = {
        on: 'SYNC',
        title: this.page.sync.getTitle(this.url),
        identifier: this.page.sync.getIdentifier(this.url),
        detectedEpisode: parseInt(`${this.page.sync.getEpisode(this.url)}`),
      };

      this.setSearchObj(
        new SearchClass(state.title, this.novel ? 'novel' : this.page.type, state.identifier),
      );
      this.searchObj.setPage(this.page);
      this.searchObj.setSyncPage(this);
      this.searchObj.setLocalUrl(this.generateLocalUrl(this.page, state));
      this.curState = state;
      await this.searchObj.search();

      try {
        tempSingle = await this.searchObj.initRules();
      } catch (e) {
        if (e instanceof UrlNotSupportedError) {
          this.incorrectUrl();
        }
        throw e;
      }

      if (!state.detectedEpisode && state.detectedEpisode !== 0) {
        if (this.page.type === 'anime') {
          state.episode = 1;
        } else {
          state.episode = 0;
        }
      } else {
        state.episode =
          state.detectedEpisode + parseInt(this.searchObj.getRuledOffset(state.detectedEpisode));
      }

      if (typeof this.page.sync.getVolume !== 'undefined') {
        state.volume = this.page.sync.getVolume(this.url);
      }
      if (this.page.type === 'anime') {
        getPlayerTime((item, player) => {
          this.tempPlayer = player;
          this.setVideoTime(item, time => {
            if (typeof player === 'undefined') {
              logger.error('No player Found');
              return;
            }
            if (typeof time !== 'undefined') {
              player.play();
              player.currentTime = time;
            }
          });
        });
      }
      logger.m('Sync', 'green').log(state);
      bloodTrail({
        category: 'info',
        message: 'Sync',
        data: state,
      });
    } else {
      if (typeof this.page.overview === 'undefined') {
        logger.log('No overview definition');
        return;
      }
      if (typeof this.page.isOverviewPage !== 'undefined' && !this.page.isOverviewPage(this.url)) {
        logger.info('Not an overview/sync page');
        return;
      }
      this.loadUI();
      state = {
        on: 'OVERVIEW',
        title: this.page.overview.getTitle(this.url),
        identifier: this.page.overview.getIdentifier(this.url),
      };

      this.setSearchObj(
        new SearchClass(state.title, this.novel ? 'novel' : this.page.type, state.identifier),
      );
      this.searchObj.setPage(this.page);
      this.searchObj.setSyncPage(this);
      this.searchObj.setLocalUrl(this.generateLocalUrl(this.page, state));
      this.curState = state;
      await this.searchObj.search();

      try {
        tempSingle = await this.searchObj.initRules();
      } catch (e) {
        if (e instanceof UrlNotSupportedError) {
          this.incorrectUrl();
        }
        throw e;
      }

      logger.m('Overview', 'green').log(state);
      bloodTrail({
        category: 'info',
        message: 'Overview',
        data: state,
      });
    }

    if (!state.identifier || !state.title) {
      Shark.captureException(new MissingDataError(this.page.name));
    }

    this.curState = state;

    let malUrl = this.searchObj.getRuledUrl(state.detectedEpisode);

    const localUrl = this.generateLocalUrl(this.page, state);

    if ((malUrl === null || !malUrl) && api.settings.get('localSync')) {
      logger.log('Local Fallback');
      malUrl = localUrl;
    }

    if (malUrl === null) {
      j.$('#MalInfo').text(api.storage.lang('Not_Found'));
      j.$('#MalData').css('display', 'none');
      logger.log('Not on mal');
    } else if (!malUrl) {
      j.$('#MalInfo').text(api.storage.lang('NothingFound'));
      j.$('#MalData').css('display', 'none');
      logger.log('Nothing found');
    } else {
      logger.log('MyAnimeList', malUrl);
      try {
        if (!tempSingle) {
          tempSingle = getSingle(malUrl);
          await tempSingle.update();
        }
        this.singleObj = tempSingle;
      } catch (e) {
        if (e instanceof UrlNotSupportedError) {
          this.incorrectUrl();
          throw e;
        } else if (e instanceof NotFoundError && api.settings.get('localSync')) {
          logger.log('Local Fallback');
          tempSingle = getSingle(localUrl);
          await tempSingle.update();
          this.singleObj = tempSingle;
        } else {
          if (tempSingle) this.singleObj = tempSingle;
          this.singleObj.flashmError(e);
          this.fillUI();
          throw e;
        }
      }

      // Discord Presence
      if (api.type === 'webextension' && api.settings.get('rpc')) {
        try {
          chrome.runtime.sendMessage(extensionId, { mode: 'active' }, function (response) {
            logger.log('Presence registred', response);
          });
        } catch (e) {
          logger.error(e);
        }
      }

      // fillUI
      this.fillUI();

      // sync
      if (this.page.isSyncPage(this.url)) {
        const rerun = await this.searchObj.openCorrectionCheck();

        if (rerun) {
          // If malUrl changed
          this.handlePage(curUrl);
          return;
        }

        if (await this.singleObj.checkSync(state.episode, state.volume)) {
          if (!(this.strongVolumes && !state.episode)) this.singleObj.setEpisode(state.episode);
          this.singleObj.setStreamingUrl(this.page.sync.getOverviewUrl(this.url));

          if (typeof state.volume !== 'undefined' && state.volume > this.singleObj.getVolume())
            this.singleObj.setVolume(state.volume);

          logger.log(`Start Sync (${api.settings.get('delay')} Seconds)`);

          // filler
          if (
            this.singleObj.getMalId() &&
            this.singleObj.getType() === 'anime' &&
            api.settings.get('checkForFiller')
          ) {
            this.checkForFiller(this.singleObj.getMalId(), this.singleObj.getEpisode());
          }

          await this.startSyncHandling(state, malUrl);
        } else {
          logger.log('Nothing to Sync');
        }
      }

      await this.imageFallback();
    }
  }

  protected async startSyncHandling(state, malUrl) {
    let mangaProgressMode = false;
    if (this.mangaProgress) {
      try {
        mangaProgressMode = await this.mangaProgress.start();
        if (!mangaProgressMode) return;
      } catch (e) {
        logger.error(e);
      }
    }

    if (!mangaProgressMode && api.settings.get(`autoTrackingMode${this.page.type}`) === 'instant') {
      setTimeout(() => {
        this.sync(state);
      }, api.settings.get('delay') * 1000);
    } else {
      const translationMsg = {
        key: `syncPage_flashm_sync_${this.page.type}`,
        value: String(state.episode),
      };

      if (this.page.type === 'manga' && !state.episode && state.volume) {
        translationMsg.key = 'syncPage_flashm_sync_manga_volume';
        translationMsg.value = String(state.volume);
      }

      let message = `<button class="sync" style="margin-bottom: 8px; background-color: transparent; border: none; color: rgb(255,64,129);margin-top: 10px;cursor: pointer;">${api.storage.lang(
        translationMsg.key,
        [providerTemplates(malUrl).shortName, translationMsg.value],
      )}</button>`;
      let options = {
        hoverInfo: true,
        error: true,
        type: 'update',
        minimized: false,
      };

      if (
        api.settings.get(`autoTrackingMode${this.page.type}`) === 'video' &&
        this.page.type === 'anime'
      ) {
        message = `
          <div id="malSyncProgress" class="ms-loading" style="background-color: transparent; position: absolute; top: 0; left: 0; right: 0; height: 4px;">
            <div class="ms-progress" style="background-color: #2980b9; width: 0%; height: 100%; transition: width 1s;"></div>
          </div>
          <div class="player-error" style="display: none; position: absolute; left: 0; right: 0; padding: 5px; bottom: 100%; color: rgb(255,64,129); background-color: #323232;">
            <span class="player-error-default">${api.storage.lang(
              'syncPage_flash_player_error',
            )}</span>
            <span class="player-error-missing-permissions" style="display: none; padding-top: 10px">
              ${api.storage.lang('settings_custom_domains_missing_permissions_header')}
            </span>
            <div style="display: flex; justify-content: space-evenly">
              <a class="player-error-missing-permissions" href="https://malsync.moe/pwa/#/settings/customDomains" style="display: none; margin: 10px; border-bottom: 2px solid #e13f7b;">
                ${api.storage.lang('Add')}
              </a>
              <a href="https://discord.com/invite/cTH4yaw" style="display: block; margin: 10px">Help</a>
            </div>

          </div>
        ${message}`;
        options = {
          hoverInfo: true,
          error: false,
          type: 'update',
          minimized: true,
        };
      }

      if (mangaProgressMode) {
        message = `
          <div id="malSyncProgress" style="background-color: transparent; position: absolute; top: 0; left: 0; right: 0; height: 4px;">
            <div class="ms-progress" style="background-color: #2980b9; width: 0%; height: 100%; transition: width 1s;"></div>
          </div>
        ${message}`;
        options = {
          hoverInfo: true,
          error: false,
          type: 'update',
          minimized: true,
        };
      }

      utils
        .flashm(message, options)
        .find('.sync')
        .on('click', () => {
          j.$('.flashinfo').remove();
          this.sync(state);
          this.resetPlayerError();
        });

      // Show error if no player gets detected for 5 minutes
      if (this.singleObj.getType() === 'anime') {
        playerTimeout = setTimeout(async () => {
          j.$('#flashinfo-div').addClass('player-error');

          if (await hasMissingPermissions()) {
            j.$('#flashinfo-div').addClass('player-error-missing-permissions');
          }

          const iframes = $('iframe')
            .toArray()
            .map(el => utils.absoluteLink($(el).attr('src'), window.location.origin))
            .filter(el => el)
            .filter(el => !isIframeUrl(el));

          con.log('No Player found', iframes);

          iframes.forEach(el => Shark.captureException(new MissingPlayerError(el!)));
        }, 5 * 60 * 1000);
      }

      // Debugging
      logger.log('overviewUrl', this.page.sync.getOverviewUrl(this.url));
      if (typeof this.page.sync.nextEpUrl !== 'undefined') {
        logger.log('nextEp', this.page.sync.nextEpUrl(this.url));
      }
    }
  }

  protected sync(state) {
    this.singleObj.setResumeWatching(this.url, state.episode);
    if (typeof this.page.sync.nextEpUrl !== 'undefined') {
      const continueWatching = this.page.sync.nextEpUrl(this.url);
      if (continueWatching && !(continueWatching.indexOf('undefined') !== -1)) {
        this.singleObj.setContinueWatching(continueWatching, state.episode! + 1);
      }
    }
    this.syncHandling(true);
  }

  public resetPlayerError() {
    if (playerTimeout) {
      clearTimeout(playerTimeout);
      playerTimeout = undefined;
      j.$('#flashinfo-div').removeClass('player-error');
      j.$('#flashinfo-div').removeClass('player-error-missing-permissions');
    }
  }

  public generateLocalUrl(page, state) {
    return `local://${page.name}/${page.type}/${state.identifier}/${encodeURIComponent(
      state.title,
    )}`;
  }

  // eslint-disable-next-line consistent-return
  public openCorrectionUi() {
    if (this.searchObj) {
      return this.searchObj.openCorrection().then(rerun => {
        if (rerun) {
          this.handlePage();
        }
      });
    }
  }

  private syncHandling(hoverInfo = false, undo = false) {
    let p;
    if (undo) {
      p = this.singleObj.undo();
    } else {
      p = this.singleObj.sync();
    }

    return p
      .then(() => {
        let message = this.singleObj.getTitle();
        let split = '<br>';
        let totalVol = this.singleObj.getTotalVolumes();
        if (totalVol === 0) totalVol = '?';
        let totalEp = this.singleObj.getTotalEpisodes();
        if (totalEp === 0) totalEp = '?';
        let diffState = this.singleObj.getStateDiff();

        if (!diffState)
          diffState = {
            onList: this.singleObj.isOnList(),
            episode: this.singleObj.getEpisode(),
            volume: this.singleObj.getVolume(),
            status: this.singleObj.getStatus(),
            score: this.singleObj.getScore(),
          };

        if (typeof diffState.onList === 'undefined') diffState.onList = true;

        if (diffState.onList && diffState.status) {
          let statusString = '';
          switch (parseInt(diffState.status)) {
            case 1:
              statusString = api.storage.lang(`UI_Status_watching_${this.page.type}`);
              break;
            case 2:
              statusString = api.storage.lang('UI_Status_Completed');
              break;
            case 3:
              statusString = api.storage.lang('UI_Status_OnHold');
              break;
            case 4:
              statusString = api.storage.lang('UI_Status_Dropped');
              break;
            case 6:
              statusString = api.storage.lang(`UI_Status_planTo_${this.page.type}`);
              break;
            case 23:
              statusString = api.storage.lang(`UI_Status_Rewatching_${this.page.type}`);
              break;
            default:
          }
          message += split + statusString;
          split = ' | ';
        }
        if (!diffState.onList) {
          message += split + api.storage.lang('removed');
          split = ' | ';
        }
        if (diffState.onList && this.page.type === 'manga' && diffState.volume) {
          message += `${split + api.storage.lang('UI_Volume')} ${diffState.volume}/${totalVol}`;
          split = ' | ';
        }
        if (diffState.onList && diffState.episode) {
          message += `${split + utils.episode(this.page.type)} ${diffState.episode}/${totalEp}`;
          split = ' | ';
        }
        if (diffState.onList && diffState.score) {
          message += `${split + api.storage.lang('UI_Score')} ${diffState.score}`;
          split = ' | ';
        }

        if (hoverInfo) {
          /* if(episodeInfoBox){//TODO
                episodeInfo(change['.add_anime[num_watched_episodes]'], actual['malurl'], message, function(){
                    undoAnime['checkIncrease'] = 0;
                    setanime(thisUrl, undoAnime, null, localListType);
                    j.$('.info-Mal-undo').remove();
                    if(j.$('.flashinfo>div').text() == ''){
                        j.$('.flashinfo').remove();
                    }
                });
            } */

          this.fullNotification(message);

          message += `
            <br>
            <button class="undoButton" style="background-color: transparent; border: none; color: rgb(255,64,129);margin-top: 10px;cursor: pointer;">
              ${api.storage.lang('syncPage_flashm_sync_undefined_undo')}
            </button>
            <button class="wrongButton" style="background-color: transparent; border: none; color: rgb(255,64,129);margin-top: 10px;cursor: pointer;">
              ${api.storage.lang('syncPage_flashm_sync_undefined_wrong')}
            </button>`;

          const flashmItem = utils.flashm(message, {
            hoverInfo: true,
            type: 'update',
          });
          flashmItem.find('.undoButton').on('click', e => {
            const fl = e.target.closest('.flash');
            if (fl) fl.remove();
            this.syncHandling(false, true);
          });
          flashmItem.find('.wrongButton').on('click', e => {
            this.openCorrectionUi();
            const fl = e.target.closest('.flash');
            if (fl) fl.remove();
            this.syncHandling(false, true);
          });
        } else {
          utils.flashm(message);
        }

        this.fillUI();
      })
      .catch(e => {
        this.singleObj.flashmError(e);
        throw e;
      });
  }

  fullNotification(text) {
    try {
      fullscreenNotification(text);
      if (api.type === 'webextension') {
        chrome.runtime.sendMessage({
          name: 'content',
          item: { action: 'fullscreenNotification', text },
        });
      }
    } catch (e) {
      logger.error(e);
    }
  }

  fillUI() {
    j.$('.MalLogin').css('display', '');
    j.$('#AddMalDiv, #LoginMalDiv').remove();

    j.$('#malRating').attr('href', this.singleObj.getDisplayUrl());

    if (this.singleObj.getLastError()) {
      j.$('.MalLogin').css('display', 'none');
      j.$('#MalData').css('display', 'flex');
      j.$('#MalInfo').text('');
      j.$('#malRating').after(
        j.html(
          `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span id='LoginMalDiv'>${this.singleObj.getLastErrorMessage()}</span>`,
        ),
      );
      return;
    }

    let scoreCheckbox = '';
    this.singleObj.getScoreCheckbox().forEach(el => {
      scoreCheckbox += `<option value="${el.value}" >${el.label}</option>`;
    });
    j.$('#malUserRating').html(j.html(scoreCheckbox));

    let statusCheckbox = '';
    this.singleObj.getStatusCheckbox().forEach(el => {
      statusCheckbox += `<option value="${el.value}" >${el.label}</option>`;
    });
    j.$('#malStatus').html(j.html(statusCheckbox));

    this.singleObj.getRating().then(rating => {
      j.$('#malRating').text(rating);
    });

    if (!this.singleObj.isOnList()) {
      j.$('.MalLogin').css('display', 'none');
      j.$('#malRating').after(
        j.html(
          `<span id='AddMalDiv'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href='#' id='AddMal' onclick='return false;'>${api.storage.lang(
            `syncPage_malObj_addAnime`,
            [this.singleObj.shortName],
          )}</a></span>`,
        ),
      );
      const This = this;
      j.$('#AddMal').click(async function (event) {
        event.preventDefault();
        if (!This.page.isSyncPage(This.url)) {
          This.singleObj.setStreamingUrl(This.url);
        }

        const rerun = await This.searchObj.openCorrectionCheck();

        if (rerun) {
          // If malUrl changed
          This.handlePage();
          return;
        }

        This.syncHandling()
          .then(() => {
            return This.singleObj.update();
          })
          .then(() => {
            This.fillUI();
          });
      });
    } else {
      j.$('#malTotal, #malTotalCha').text(this.singleObj.getTotalEpisodes());
      if (this.singleObj.getTotalEpisodes() === 0) {
        j.$('#malTotal, #malTotalCha').text('?');
      }

      j.$('#malTotalVol').text(this.singleObj.getTotalVolumes());
      if (this.singleObj.getTotalVolumes() === 0) {
        j.$('#malTotalVol').text('?');
      }

      j.$('#malEpisodes').val(this.singleObj.getEpisode());
      j.$('#malVolumes').val(this.singleObj.getVolume());

      j.$('#malStatus').val(this.singleObj.getStatusCheckboxValue());
      j.$('#malUserRating').val(this.singleObj.getScoreCheckboxValue());
    }
    j.$('#MalData').css('display', 'flex');
    j.$('#MalInfo').text('');

    this.calcSelectWidth(j.$('#malEpisodes, #malVolumes, #malUserRating, #malStatus'));
    j.$('#malEpisodes, #malVolumes').trigger('input');

    try {
      this.handleList(true);
    } catch (e) {
      logger.error(e);
    }
  }

  handleList(searchCurrent = false, reTry = 0) {
    if (!this.singleObj) return; // Object not ready yet
    j.$('.mal-sync-active').removeClass('mal-sync-active');
    if (
      typeof this.page.overview !== 'undefined' &&
      typeof this.page.overview.list !== 'undefined'
    ) {
      const epList = this.getEpList();
      if (typeof epList !== 'undefined' && epList.length > 0) {
        this.offsetHandler(epList);
        if (this.page.overview.list.elementUrl) {
          const { elementUrl } = this.page.overview.list;
          logger.log(
            'Episode List',
            j.$.map(epList, function (val, i) {
              if (typeof val !== 'undefined') {
                return elementUrl(val);
              }
              return '-';
            }),
          );
          if (typeof this.page.overview.list.handleListHook !== 'undefined')
            this.page.overview.list.handleListHook(this.singleObj.getEpisode(), epList);
          const curEp = epList[parseInt(this.singleObj.getEpisode() || 1)];
          if (
            typeof curEp === 'undefined' &&
            !curEp &&
            searchCurrent &&
            reTry < 10 &&
            typeof this.page.overview.list.paginationNext !== 'undefined'
          ) {
            logger.log('Pagination next');
            const This = this;
            if (this.page.overview.list.paginationNext(false)) {
              setTimeout(function () {
                reTry++;
                This.handleList(true, reTry);
              }, 500);
            }
          }

          const nextEp = epList[this.singleObj.getEpisode() + 1];
          if (typeof nextEp !== 'undefined' && nextEp && !this.page.isSyncPage(this.url)) {
            const message = `<a href="${elementUrl(nextEp)}">${api.storage.lang(
              `syncPage_malObj_nextEp_${this.page.type}`,
              [this.singleObj.getEpisode() + 1],
            )}</a>`;
            utils.flashm(message, {
              hoverInfo: true,
              type: 'nextEp',
              minimized: true,
            });
          }
        }
      }
    }
  }

  getEpList() {
    const This = this;
    const elementArray = [] as JQuery<HTMLElement>[];
    if (
      typeof this.page.overview !== 'undefined' &&
      typeof this.page.overview.list !== 'undefined'
    ) {
      const { elementEp } = this.page.overview.list;
      let currentEpisode = 0;
      if (this.singleObj) {
        currentEpisode = parseInt(this.singleObj.getEpisode());
      }

      this.page.overview.list.elementsSelector().each(function (index, el) {
        try {
          const elEp = parseInt(`${elementEp(j.$(el))}`) + parseInt(This.getOffset());
          elementArray[elEp] = j.$(el);
          if (
            (api.settings.get('highlightAllEp') && elEp <= currentEpisode) ||
            elEp === currentEpisode
          ) {
            j.$(el).addClass('mal-sync-active');
          }
        } catch (e) {
          logger.info(e);
        }
      });
    }
    return elementArray;
  }

  offsetHandler(epList) {
    if (!this.page.overview!.list!.offsetHandler) return;
    if (this.getOffset()) return;
    if (!this.searchObj || this.searchObj.provider === 'user') return;
    for (let i = 0; i < epList.length; ++i) {
      if (typeof epList[i] !== 'undefined') {
        logger.log('Offset', i);
        if (i > 1) {
          const calcOffset = 1 - i;
          utils.flashConfirm(
            api.storage.lang('syncPage_flashConfirm_offsetHandler_1', [String(calcOffset)]),
            'offset',
            () => {
              this.setOffset(calcOffset);
            },
            () => {
              this.setOffset(0);
            },
            true,
          );
        }
        return;
      }
    }
  }

  async imageFallback() {
    if (this.singleObj && typeof this.singleObj.setImage !== 'undefined' && this.page.getImage) {
      const image = await this.page.getImage();
      if (image) this.singleObj.setImage(image);
    }
  }

  incorrectUrl() {
    utils.flashm('Incorrect url provided', {
      error: true,
      type: 'error',
    });
    this.openCorrectionUi();
  }

  testForCloudflare() {
    if (document.title === 'Just a moment...' || document.title.indexOf('Cloudflare') !== -1) {
      return true;
    }
    return false;
  }

  cdn(type: 'default' | 'captcha' | 'blocked' = 'default') {
    api.storage.addStyle(`
      .bubbles {
        display: none !important;
      }
      div#cf-content:before {
        content: '';
        background-image: url(https://raw.githubusercontent.com/MALSync/MALSync/master/assets/icons/icon128.png);
        height: 64px;
        width: 64px;
        display: block;
        background-size: cover;
        animation: rotate 3s linear infinite;
        background-color: #251e2b;
        border-radius: 50%;
      }
      @keyframes rotate{ to{ transform: rotate(360deg); } }
    `);
  }

  getOffset() {
    if (this.searchObj && this.searchObj.getOffset()) {
      return this.searchObj.getOffset();
    }
    return 0;
  }

  async setOffset(value: number) {
    if (this.searchObj) {
      this.searchObj.setOffset(value);
    }
    if (typeof this.singleObj !== 'undefined') {
      api.storage.remove(`updateCheck/${this.singleObj.getType()}/${this.singleObj.getCacheKey()}`);
    }
  }

  UILoaded = false;

  private loadUI() {
    const This = this;
    if (this.UILoaded) return;
    this.UILoaded = true;
    const wrapEnd = '</span>';

    let ui = '<p id="malp">';
    ui += `<span id="MalInfo">${api.storage.lang('Loading')}</span>`;

    ui +=
      '<span id="MalData" style="display: none; justify-content: space-between; flex-wrap: wrap;">';

    ui += '<span style="display: inline-block;" class="malp-group malp-group-rating">';
    ui += `<span class="info malp-group-label">${api.storage.lang('search_Score')} </span>`;
    ui +=
      '<a id="malRating" class="malp-group-field" style="min-width: 30px;display: inline-block;" target="_blank" href="">____</a>';
    ui += wrapEnd;

    // ui += '<span id="MalLogin">';
    const wrapStart = (section: string) =>
      `<span style="display: inline-block; display: none;" class="MalLogin malp-group malp-group-${section}">`;

    ui += wrapStart('status');
    ui += `<span class="info malp-group-label">${api.storage.lang('UI_Status')} </span>`;
    ui += '<select id="malStatus" class="malp-group-field malp-group-select">';
    ui += '</select>';
    ui += wrapEnd;

    let middle = '';
    if (this.page.type === 'anime') {
      middle += wrapStart('episode');
      middle += `<span class="info malp-group-label">${api.storage.lang('UI_Episode')} </span>`;
      middle +=
        '<span style=" text-decoration: none; outline: medium none;" class="malp-group-value-section">';
      middle +=
        '<input id="malEpisodes" class="malp-group-field malp-group-input" value="0" type="text" size="1" maxlength="4">';
      middle += '/<span id="malTotal" class="malp-group-value">0</span>';
      middle += '</span>';
      middle += wrapEnd;
    } else {
      middle += wrapStart('volume');
      middle += `<span class="info malp-group-label">${api.storage.lang('UI_Volume')} </span>`;
      middle +=
        '<span style=" text-decoration: none; outline: medium none;" class="malp-group-value-section">';
      middle +=
        '<input id="malVolumes" class="malp-group-field malp-group-input" value="0" type="text" size="1" maxlength="4">';
      middle += '/<span id="malTotalVol" class="malp-group-value">0</span>';
      middle += '</span>';
      middle += wrapEnd;

      middle += wrapStart('chapter');
      middle += `<span class="info malp-group-label">${api.storage.lang('UI_Chapter')} </span>`;
      middle +=
        '<span style=" text-decoration: none; outline: medium none;" class="malp-group-value-section">';
      middle +=
        '<input id="malEpisodes" class="malp-group-field malp-group-input" value="0" type="text" size="1" maxlength="4">';
      middle += '/<span id="malTotalCha" class="malp-group-value">0</span>';
      middle += '</span>';
      middle += wrapEnd;
    }

    ui += middle;

    ui += wrapStart('score');
    ui += `<span class="info malp-group-label">${api.storage.lang('UI_Score')}</span>`;
    ui += '<select id="malUserRating" class="malp-group-field malp-group-select">';
    ui += '</select>';
    ui += wrapEnd;

    // ui += '</span>';
    ui += '</span>';
    ui += '</p>';

    if (this.page.isSyncPage(this.url)) {
      if (typeof this.page.sync.uiSelector !== 'undefined') {
        this.page.sync.uiSelector(ui);
      }
    } else if (typeof this.page.overview !== 'undefined') {
      this.page.overview.uiSelector(ui);
    }

    j.$('#malEpisodes, #malVolumes, #malUserRating, #malStatus').change(function () {
      This.buttonclick();
      // @ts-ignore
      const el = j.$(this);
      This.calcSelectWidth(el);
    });

    j.$('#malEpisodes, #malVolumes')
      .on('input', function () {
        // @ts-ignore
        const el = j.$(this);
        let numberlength = el.val()!.toString().length;
        if (numberlength < 1) numberlength = 1;
        const numberWidth = numberlength * 7.7 + 3;
        el.css('width', `${numberWidth}px`);
      })
      .trigger('input');
  }

  private calcSelectWidth(selectors) {
    selectors.each(function (index, selector) {
      const text = j.$(selector).find('option:selected').text();
      const aux = j.$('<select style="width: auto;"/>').append(j.html(`<option>${text}</option>`));
      const width = aux.width() || 0;

      if (width) {
        j.$('#malp').append(
          // @ts-expect-error
          // TODO --fix this line doesn't make sense
          // .html will return [object Object] 'cause aux is JQuery<HTMLElement>
          j.html(aux),
        );
        j.$(selector).width(width + 5);
        aux.remove();
      }
    });
  }

  private async buttonclick() {
    this.singleObj.setEpisode(j.$('#malEpisodes').val());
    if (j.$('#malVolumes').length) this.singleObj.setVolume(j.$('#malVolumes').val());
    this.singleObj.handleScoreCheckbox(j.$('#malUserRating').val());
    this.singleObj.handleStatusCheckbox(j.$('#malStatus').val());
    if (!this.page.isSyncPage(this.url)) {
      this.singleObj.setStreamingUrl(this.url);
    }

    const rerun = await this.searchObj.openCorrectionCheck();

    if (rerun) {
      // If malUrl changed
      this.handlePage();
      return;
    }

    this.syncHandling()
      .then(() => {
        return this.singleObj.update();
      })
      .then(() => {
        this.fillUI();
      });
  }

  private browsingtime: number | undefined = Date.now();

  private presence(info, sender, sendResponse) {
    try {
      if (info.action === 'presence') {
        console.log('Presence requested', info, this.curState);

        // Reset browsingTime if not in focus for more than 5 min
        clearTimeout(browsingTimeout);
        browsingTimeout = setTimeout(() => {
          this.browsingtime = undefined;
        }, 5 * 60 * 1000);
        if (!this.browsingtime) this.browsingtime = Date.now();

        // Cover
        let presenceShowCover = true;
        let presenceHidePage = true;

        const option = api.settings.get('presenceLargeImage');

        switch (option) {
          case 'website':
            presenceShowCover = false;
            presenceHidePage = false;
            break;

          case 'malsync':
            presenceShowCover = false;
            presenceHidePage = true;
            break;

          default:
            break;
        }

        let clientId = '606504719212478504';
        if (!api.settings.get('presenceShowMalsync')) {
          if (this.page.type !== 'anime') {
            clientId = '823563138669608980';
          } else {
            clientId = '823563096747802695';
          }
        }

        let largeImageKeyTemp;
        let largeImageTextTemp;
        if (!presenceHidePage) {
          largeImageKeyTemp = this.page.name.toLowerCase();
          largeImageTextTemp = `${this.page.name} • MAL-Sync`;
        } else {
          largeImageKeyTemp = 'malsync';
          largeImageTextTemp = 'MAL-Sync';
        }

        if (presenceShowCover && this.singleObj.getImage()) {
          largeImageKeyTemp = this.singleObj.getImage();
        }

        if (this.curState) {
          const pres: any = {
            clientId,
            presence: {
              details: this.singleObj.getTitle(true) || this.curState.title,
              largeImageKey: largeImageKeyTemp,
              largeImageText: largeImageTextTemp,
              instance: true,
            },
          };

          if (api.settings.get('presenceShowButtons')) {
            let url = null;
            if (this.singleObj.shortName !== 'Local') url = this.singleObj.getDisplayUrl();
            if (!url) url = this.singleObj.getMalUrl();
            if (!url && !presenceHidePage) url = this.singleObj.getStreamingUrl();
            if (url) {
              pres.presence.buttons = [
                {
                  label: api.storage.lang(`discord_rpc_view_${this.singleObj.getType()}`),
                  url,
                },
              ];
            }
          }
          if (typeof this.curState.episode !== 'undefined') {
            const stateParts: string[] = [];

            if (this.curState.episode > 0) {
              let totalEp = this.singleObj.getTotalEpisodes();
              totalEp = totalEp ? `/${totalEp}` : '';
              stateParts.push(
                `${utils.episode(this.page.type)} ${this.curState.episode}${totalEp}`,
              );
            }

            if (this.curState.volume > 0) {
              const vol = this.curState.volume;
              let totalVol = this.singleObj.getTotalVolumes();
              totalVol = totalVol ? `/${totalVol}` : '';
              stateParts.push(`${api.storage.lang('UI_Volume')} ${vol}${totalVol}`);
            }

            pres.presence.state = stateParts.join(' | ');

            if (typeof this.curState.lastVideoTime !== 'undefined') {
              if (this.curState.lastVideoTime.paused) {
                pres.presence.smallImageKey = 'pause';
                pres.presence.smallImageText = 'Paused';
              } else {
                const timeleft =
                  this.curState.lastVideoTime.duration - this.curState.lastVideoTime.current;
                pres.presence.endTimestamp = Date.now() + timeleft * 1000;
                pres.presence.smallImageKey = 'play';
                pres.presence.smallImageText = 'Playing';
              }
            } else {
              pres.presence.startTimestamp = this.browsingtime;
              if (this.page.type !== 'anime') {
                pres.presence.smallImageKey = 'reading';
                pres.presence.smallImageText = 'Reading';
              }
            }
          } else {
            let browsingTemp;
            if (!presenceHidePage) {
              browsingTemp = this.page.name;
            } else {
              browsingTemp = this.page.type.toString();
            }
            pres.presence.startTimestamp = this.browsingtime;
            pres.presence.state = api.storage.lang('Discord_rpc_browsing', [browsingTemp]);
          }

          sendResponse(pres);
          return;
        }
      }
    } catch (e) {
      logger.error(e);
    }
    sendResponse({});
  }

  private async checkForFiller(malid: number, episode: number) {
    const page = Math.ceil(episode / 100);

    const cacheObj = new Cache(`fillers/${malid}/${page}`, 7 * 24 * 60 * 60 * 1000);

    if (!(await cacheObj.hasValueAndIsNotEmpty())) {
      const url = `https://api.jikan.moe/v4/anime/${malid}/episodes?page=${page}`;
      const request = await api.request.xhr('GET', url).then(async response => {
        try {
          if (response.status === 200 && response.responseText) {
            const data = JSON.parse(response.responseText);
            if (data.data && data.data.length) {
              return data.data
                .map(e => ({
                  filler: e.filler,
                  recap: e.recap,
                  episode_id: e.mal_id, // mal_id is the episode_id in the v4 API very stupid
                }))
                .filter(e => e.filler || e.recap);
            }
          }
        } catch (e) {
          // do nothing.
        }
        return [];
      });
      await cacheObj.setValue(request);
    }
    const episodes = await cacheObj.getValue();

    if (episodes && episodes.length) {
      const episodeData = episodes.find(e => e.episode_id === episode);
      if (episodeData && (episodeData.filler || episodeData.recap)) {
        const type = episodeData.filler ? 'filler' : 'recap';
        utils.flashConfirm(
          api.storage.lang(`filler_${type}_confirm`),
          'filler',
          () => {
            this.openNextEp();
          },
          () => {
            // do nothing.
          },
          true,
        );
      }
    }
  }
}
