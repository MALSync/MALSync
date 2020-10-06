import { pageInterface, pageState } from './pageInterface';
import { getSingle } from '../_provider/singleFactory';
import { initFloatButton } from '../floatbutton/init';
import { providerTemplates } from '../provider/templates';
import { getPlayerTime } from '../utils/player';
import { searchClass } from '../_provider/Search/vueSearchClass';

declare let browser: any;

let extensionId = 'agnaejlkbiiggajjmnpmeheigkflbnoo'; // Chrome
if (typeof browser !== 'undefined' && typeof chrome !== 'undefined') {
  extensionId = '{57081fef-67b4-482f-bcb0-69296e63ec4f}'; // Firefox
}

const logger = con.m('Sync', '#348fff');

export class syncPage {
  page: pageInterface;

  searchObj;

  singleObj;

  public novel = false;

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
  }

  init() {
    const This = this;
    j.$(document).ready(function() {
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
            `${
              utils
                .urlPart(domain, 2)
                .replace('.com.br', '.br')
                .split('.')
                .slice(-2, -1)[0]
            }.`,
          ) > -1
        ) {
          return true;
        }
        return false;
      }
    }
    return null;
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
    const syncDuration = api.settings.get('videoDuration');
    const progress = (item.current / (item.duration * (syncDuration / 100))) * 100;
    if (j.$('#malSyncProgress').length) {
      if (progress < 100) {
        j.$('.ms-progress').css('width', `${progress}%`);
        j.$('#malSyncProgress')
          .removeClass('ms-loading')
          .removeClass('ms-done');
      } else {
        j.$('#malSyncProgress').addClass('ms-done');
        j.$('.flash.type-update .sync').click();
      }
    }
    this.handleVideoResume(item, timeCb);
    this.autoNextEp(item);
  }

  autoNextEpRun = false;

  public autoNextEp(item) {
    if (api.settings.get('autoNextEp') && !this.autoNextEpRun && item.current === item.duration) {
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
        localStorage.setItem(localSelector, item.current);
        this.curState.videoChecked = true;
        setTimeout(() => {
          this.curState.videoChecked = 2;
        }, 10000);
      }
    } else {
      const localItem = localStorage.getItem(localSelector);
      logger.info('Resume', localItem);
      if (localItem !== null && parseInt(localItem) - 30 > item.current && parseInt(localItem) > 30) {
        if (!j.$('#MALSyncResume').length)
          j.$('#MALSyncResume')
            .parent()
            .parent()
            .remove();
        const resumeTime = Math.round(parseInt(localItem));
        let resumeTimeString = '';

        if (api.settings.get('autoresume')) {
          timeCb(resumeTime);
          This.curState.videoChecked = 2;
          return;
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

        resumeMsg.find('.sync').on('click', function() {
          timeCb(resumeTime);
          This.curState.videoChecked = 2;
          // @ts-ignore
          j.$(this)
            .parent()
            .parent()
            .remove();
        });

        resumeMsg.find('.resumeClose').on('click', function() {
          This.curState.videoChecked = 2;
          // @ts-ignore
          j.$(this)
            .parent()
            .parent()
            .remove();
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
    $('#flashinfo-div, #flash-div-bottom, #flash-div-top, #malp').remove();
  }

  async handlePage(curUrl = window.location.href) {
    let state: pageState;
    this.curState = undefined;
    this.searchObj = undefined;
    const This = this;
    this.url = curUrl;
    this.browsingtime = Date.now();

    if (this.page.isSyncPage(this.url)) {
      this.loadUI();
      state = {
        on: 'SYNC',
        title: this.page.sync.getTitle(this.url),
        identifier: this.page.sync.getIdentifier(this.url),
      };

      this.searchObj = new searchClass(state.title, this.novel ? 'novel' : this.page.type, state.identifier);
      this.searchObj.setPage(this.page);
      this.searchObj.setSyncPage(this);
      this.curState = state;
      await this.searchObj.search();

      state.episode = +parseInt(`${this.page.sync.getEpisode(this.url)}`) + parseInt(this.getOffset());
      if (!state.episode && state.episode !== 0) {
        if (this.page.type === 'anime') {
          state.episode = 1;
        } else {
          state.episode = 0;
        }
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

      this.searchObj = new searchClass(state.title, this.novel ? 'novel' : this.page.type, state.identifier);
      this.searchObj.setPage(this.page);
      this.searchObj.setSyncPage(this);
      this.curState = state;
      await this.searchObj.search();

      logger.m('Overview', 'green').log(state);
    }

    this.curState = state;

    let malUrl = this.searchObj.getUrl();

    const localUrl = `local://${this.page.name}/${this.page.type}/${state.identifier}/${encodeURIComponent(
      state.title,
    )}`;

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
        this.singleObj = getSingle(malUrl);
        await this.singleObj.update();
      } catch (e) {
        if (e.code === 901) {
          utils.flashm('Incorrect url provided', {
            error: true,
            type: 'error',
          });
          throw e;
        } else if (e.code === 904 && api.settings.get('localSync')) {
          logger.log('Local Fallback');
          this.singleObj = getSingle(localUrl);
          await this.singleObj.update();
        } else {
          this.singleObj.flashmError(e);
          this.fillUI();
          throw e;
        }
      }

      // Discord Presence
      if (api.type === 'webextension' && api.settings.get('rpc')) {
        try {
          chrome.runtime.sendMessage(extensionId, { mode: 'active' }, function(response) {
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
        if (
          !(
            typeof api.settings.get('enablePages')[this.page.name] === 'undefined' ||
            api.settings.get('enablePages')[this.page.name]
          )
        ) {
          logger.info('Sync is disabled for this page', this.page.name);
          return;
        }

        const rerun = await this.searchObj.openCorrectionCheck();

        if (rerun) {
          // If malUrl changed
          this.handlePage(curUrl);
          return;
        }

        if (await this.singleObj.checkSync(state.episode, state.volume, this.novel)) {
          this.singleObj.setEpisode(state.episode);
          this.singleObj.setStreamingUrl(this.page.sync.getOverviewUrl(this.url));

          if (typeof state.volume !== 'undefined' && state.volume > this.singleObj.getVolume())
            this.singleObj.setVolume(state.volume);

          logger.log(`Start Sync (${api.settings.get('delay')} Seconds)`);

          if (api.settings.get(`autoTrackingMode${this.page.type}`) === 'instant') {
            setTimeout(() => {
              sync();
            }, api.settings.get('delay') * 1000);
          } else {
            let message = `<button class="sync" style="margin-bottom: 8px; background-color: transparent; border: none; color: rgb(255,64,129);margin-top: 10px;cursor: pointer;">${api.storage.lang(
              `syncPage_flashm_sync_${This.page.type}`,
              [providerTemplates(malUrl).shortName, String(state.episode)],
            )}</button>`;
            let options = {
              hoverInfo: true,
              error: true,
              type: 'update',
              minimized: false,
            };

            if (api.settings.get(`autoTrackingMode${this.page.type}`) === 'video' && this.page.type === 'anime') {
              message = `
                <div id="malSyncProgress" class="ms-loading" style="background-color: transparent; position: absolute; top: 0; left: 0; right: 0; height: 4px;">
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
              .on('click', function() {
                j.$('.flashinfo').remove();
                sync();
              });
            // Debugging
            logger.log('overviewUrl', This.page.sync.getOverviewUrl(This.url));
            if (typeof This.page.sync.nextEpUrl !== 'undefined') {
              logger.log('nextEp', This.page.sync.nextEpUrl(This.url));
            }
          }

          function sync() {
            This.singleObj.setResumeWatching(This.url, state.episode);
            if (typeof This.page.sync.nextEpUrl !== 'undefined') {
              const continueWatching = This.page.sync.nextEpUrl(This.url);
              if (continueWatching && !(continueWatching.indexOf('undefined') !== -1)) {
                This.singleObj.setContinueWatching(continueWatching, state.episode! + 1);
              }
            }
            This.syncHandling(true);
          }
        } else {
          logger.log('Nothing to Sync');
        }
      }
    }
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
            episode: this.singleObj.getEpisode(),
            volume: this.singleObj.getVolume(),
            status: this.singleObj.getStatus(),
            score: this.singleObj.getScore(),
          };

        if (diffState.status) {
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
        if (this.page.type === 'manga' && diffState.volume) {
          message += `${split + api.storage.lang('UI_Volume')} ${diffState.volume}/${totalVol}`;
          split = ' | ';
        }
        if (diffState.episode) {
          message += `${split + utils.episode(this.page.type)} ${diffState.episode}/${totalEp}`;
          split = ' | ';
        }
        if (diffState.score) {
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

  fillUI() {
    j.$('.MalLogin').css('display', 'initial');
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
      j.$('#AddMal').click(async function() {
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
    j.$('.mal-sync-active').removeClass('mal-sync-active');
    if (typeof this.page.overview !== 'undefined' && typeof this.page.overview.list !== 'undefined') {
      const epList = this.getEpList();
      if (typeof epList !== 'undefined' && epList.length > 0) {
        this.offsetHandler(epList);
        const { elementUrl } = this.page.overview.list;
        logger.log(
          'Episode List',
          j.$.map(epList, function(val, i) {
            if (typeof val !== 'undefined') {
              return elementUrl(val);
            }
            return '-';
          }),
        );
        if (typeof this.page.overview.list.handleListHook !== 'undefined')
          this.page.overview.list.handleListHook(this.singleObj.getEpisode(), epList);
        const curEp = epList[parseInt(this.singleObj.getEpisode())];
        if (
          typeof curEp === 'undefined' &&
          !curEp &&
          this.singleObj.getEpisode() &&
          searchCurrent &&
          reTry < 10 &&
          typeof this.page.overview.list.paginationNext !== 'undefined'
        ) {
          logger.log('Pagination next');
          const This = this;
          if (this.page.overview.list.paginationNext(false)) {
            setTimeout(function() {
              reTry++;
              This.handleList(true, reTry);
            }, 500);
          }
        }

        const nextEp = epList[this.singleObj.getEpisode() + 1];
        if (typeof nextEp !== 'undefined' && nextEp && !this.page.isSyncPage(this.url)) {
          const message = `<a href="${elementUrl(
            nextEp,
          )}">${api.storage.lang(`syncPage_malObj_nextEp_${this.page.type}`, [this.singleObj.getEpisode() + 1])}</a>`;
          utils.flashm(message, {
            hoverInfo: true,
            type: 'nextEp',
            minimized: true,
          });
        }
      }
    }
  }

  getEpList() {
    const This = this;
    const elementArray = [] as JQuery<HTMLElement>[];
    if (typeof this.page.overview !== 'undefined' && typeof this.page.overview.list !== 'undefined') {
      const { elementEp } = this.page.overview.list;
      let currentEpisode = 0;
      if (this.singleObj) {
        currentEpisode = parseInt(this.singleObj.getEpisode());
      }

      this.page.overview.list.elementsSelector().each(function(index, el) {
        try {
          const elEp = parseInt(`${elementEp(j.$(el))}`) + parseInt(This.getOffset());
          elementArray[elEp] = j.$(el);
          if ((api.settings.get('highlightAllEp') && elEp <= currentEpisode) || elEp === currentEpisode) {
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
          );
        }
        return;
      }
    }
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
    let wrapStart = '<span style="display: inline-block;">';
    const wrapEnd = '</span>';

    let ui = '<p id="malp">';
    ui += `<span id="MalInfo">${api.storage.lang('Loading')}</span>`;

    ui += '<span id="MalData" style="display: none; justify-content: space-between; flex-wrap: wrap;">';

    ui += wrapStart;
    ui += `<span class="info">${api.storage.lang('search_Score')} </span>`;
    ui += '<a id="malRating" style="min-width: 30px;display: inline-block;" target="_blank" href="">____</a>';
    ui += wrapEnd;

    // ui += '<span id="MalLogin">';
    wrapStart = '<span style="display: inline-block; display: none;" class="MalLogin">';

    ui += wrapStart;
    ui += `<span class="info">${api.storage.lang('UI_Status')} </span>`;
    ui += '<select id="malStatus">';
    ui += '</select>';
    ui += wrapEnd;

    let middle = '';
    if (this.page.type === 'anime') {
      middle += wrapStart;
      middle += `<span class="info">${api.storage.lang('UI_Episode')} </span>`;
      middle += '<span style=" text-decoration: none; outline: medium none;">';
      middle += '<input id="malEpisodes" value="0" type="text" size="1" maxlength="4">';
      middle += '/<span id="malTotal">0</span>';
      middle += '</span>';
      middle += wrapEnd;
    } else {
      middle += wrapStart;
      middle += `<span class="info">${api.storage.lang('UI_Volume')} </span>`;
      middle += '<span style=" text-decoration: none; outline: medium none;">';
      middle += '<input id="malVolumes" value="0" type="text" size="1" maxlength="4">';
      middle += '/<span id="malTotalVol">0</span>';
      middle += '</span>';
      middle += wrapEnd;

      middle += wrapStart;
      middle += `<span class="info">${api.storage.lang('UI_Chapter')} </span>`;
      middle += '<span style=" text-decoration: none; outline: medium none;">';
      middle += '<input id="malEpisodes" value="0" type="text" size="1" maxlength="4">';
      middle += '/<span id="malTotalCha">0</span>';
      middle += '</span>';
      middle += wrapEnd;
    }

    ui += middle;

    ui += wrapStart;
    ui += `<span class="info">${api.storage.lang('UI_Score')}</span>`;
    ui += '<select id="malUserRating">';
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

    j.$('#malEpisodes, #malVolumes, #malUserRating, #malStatus').change(function() {
      This.buttonclick();
      // @ts-ignore
      const el = j.$(this);
      This.calcSelectWidth(el);
    });

    j.$('#malEpisodes, #malVolumes')
      .on('input', function() {
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
    selectors.each(function(index, selector) {
      const text = j
        .$(selector)
        .find('option:selected')
        .text();
      const aux = j.$('<select style="width: auto;"/>').append(j.html(`<option>${text}</option>`));
      const width = aux.width() || 0;
      if (width) {
        j.$('#malp').append(j.html(aux));
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

  private browsingtime = Date.now();

  private presence(info, sender, sendResponse) {
    try {
      if (info.action === 'presence') {
        console.log('Presence requested', info, this.curState);

        let largeImageKeyTemp;
        let largeImageTextTemp;
        if (!api.settings.get('presenceHidePage')) {
          largeImageKeyTemp = this.page.name.toLowerCase();
          largeImageTextTemp = this.page.name;
        } else {
          largeImageKeyTemp = 'malsync';
          largeImageTextTemp = 'MAL-Sync';
        }

        if (this.curState) {
          const pres: any = {
            clientId: '606504719212478504',
            presence: {
              details: this.singleObj.getTitle() || this.curState.title,
              largeImageKey: largeImageKeyTemp,
              largeImageText: largeImageTextTemp,
              instance: true,
            },
          };

          if (typeof this.curState.episode !== 'undefined') {
            const ep = this.curState.episode;
            let totalEp = this.singleObj.getTotalEpisodes();
            if (!totalEp) totalEp = '?';

            pres.presence.state = `${utils.episode(this.page.type)} ${ep} of ${totalEp}`;

            if (typeof this.curState.lastVideoTime !== 'undefined') {
              if (this.curState.lastVideoTime.paused) {
                pres.presence.smallImageKey = 'pause';
                pres.presence.smallImageText = 'pause';
              } else {
                const timeleft = this.curState.lastVideoTime.duration - this.curState.lastVideoTime.current;
                pres.presence.endTimestamp = Date.now() + timeleft * 1000;
                pres.presence.smallImageKey = 'play';
                pres.presence.smallImageText = 'playing';
              }
            } else {
              if (typeof this.curState.startTime === 'undefined') {
                this.curState.startTime = Date.now();
              }
              pres.presence.startTimestamp = this.curState.startTime;
            }
            sendResponse(pres);
            return;
          }

          let browsingTemp;
          if (!api.settings.get('presenceHidePage')) {
            browsingTemp = this.page.name;
          } else {
            browsingTemp = this.page.type.toString();
          }
          pres.presence.startTimestamp = this.browsingtime;
          pres.presence.state = api.storage.lang('Discord_rpc_browsing', [browsingTemp]);
          sendResponse(pres);
          return;
        }
      }
    } catch (e) {
      logger.error(e);
    }
    sendResponse({});
  }
}
