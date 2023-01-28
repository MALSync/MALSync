import * as definitions from './definitions';

import { Progress } from '../utils/progress';
import { predictionXhrGET } from '../background/releaseProgress';

import { emitter, globalEmit } from '../utils/emitter';
import { SafeError } from '../utils/errors';
import { errorMessage as _errorMessage } from './Errors';
import { point10 } from './ScoreMode/point10';
import { SyncTypes } from './helper';

Object.seal(emitter);

export abstract class SingleAbstract {
  constructor(protected url: string) {
    this.handleUrl(url);
    this.logger = con.m('[S]', '#348fff');
    return this;
  }

  protected logger;

  protected type: definitions.contentType | null = null;

  protected persistanceState;

  protected undoState;

  protected lastError;

  public abstract shortName: string;

  protected abstract authenticationUrl: string;

  protected rewatchingSupport = true;

  protected ids = {
    mal: NaN,
    ani: NaN,
    kitsu: {
      id: NaN,
      slug: '',
    },
    simkl: NaN,
  };

  protected options: {
    u: string;
    c: any;
    r: any;
    p: any;
  } | null = null;

  protected abstract handleUrl(url: string);

  public getType() {
    return this.type;
  }

  public getUrl() {
    return this.url;
  }

  public supportsRewatching() {
    return this.rewatchingSupport;
  }

  public abstract getCacheKey();

  public abstract getPageId();

  public getApiCacheKey(): string | number {
    return this.getKey(['ANILIST']);
  }

  public getRulesCacheKey(): string | number {
    return this.getKey(['ANILIST', 'KITSU'], false);
  }

  abstract _setStatus(status: definitions.status): void;

  public setStatus(status: definitions.status): SingleAbstract {
    status = Number(status);
    this._setStatus(status);
    return this;
  }

  abstract _getStatus(): definitions.status | number;

  public getStatus(): definitions.status {
    if (!this.isOnList()) return definitions.status.NoState;
    return this._getStatus();
  }

  public getScoreMode() {
    return point10;
  }

  abstract _setScore(score: definitions.score): void;

  /**
   * @deprecated Use setAbsoluteScore instead
   */
  public setScore(score: definitions.score): SingleAbstract {
    score = parseInt(`${score}`);
    if (!score) score = 0;
    this._setScore(score);
    return this;
  }

  abstract _getScore(): definitions.score;

  /**
   * @deprecated Use getAbsoluteScore instead
   */
  public getScore(): definitions.score {
    const score = this._getScore();
    if (!score) return 0;
    return score;
  }

  abstract _setAbsoluteScore(score: definitions.score100): void;

  public setAbsoluteScore(score: definitions.score100): SingleAbstract {
    score = parseInt(`${score}`);
    this._setAbsoluteScore(score);
    return this;
  }

  abstract _getAbsoluteScore(): definitions.score100;

  public getAbsoluteScore(): definitions.score100 {
    const score = this._getAbsoluteScore();
    if (!score) return 0;
    return score;
  }

  abstract _setEpisode(episode: number): void;

  public setEpisode(episode: number): SingleAbstract {
    episode = parseInt(`${episode}`);
    if (this.getTotalEpisodes() && episode > this.getTotalEpisodes())
      episode = this.getTotalEpisodes();
    this._setEpisode(episode);
    return this;
  }

  abstract _getEpisode(): number;

  public getEpisode(): number {
    return this._getEpisode();
  }

  abstract _setVolume(volume: number): void;

  public setVolume(volume: number): SingleAbstract {
    this._setVolume(volume);
    return this;
  }

  abstract _getVolume(): number;

  public getVolume(): number {
    return this._getVolume();
  }

  abstract _setTags(tags: string): void;

  abstract _getTags(): string;

  public setStreamingUrl(streamingUrl: string): SingleAbstract {
    if (this.options) {
      this.options.u = streamingUrl;
    }
    return this;
  }

  public getStreamingUrl(): string | undefined {
    if (this.options && this.options.u) {
      return this.options.u;
    }

    return undefined;
  }

  public cleanTags() {
    this.options = null;
  }

  protected progress: false | Progress = false;

  protected progressXhr;

  public async initProgress() {
    const xhr = await predictionXhrGET(this.getType()!, this.getApiCacheKey());
    return new Progress(this.getCacheKey(), this.getType()!)
      .init({
        uid: this.getCacheKey(),
        apiCacheKey: this.getApiCacheKey(),
        title: this.getTitle(),
        cacheKey: this.getCacheKey(),
        progressMode: this.getProgressMode(),
        watchedEp: this.getEpisode(),
        single: this,
        xhr,
      })
      .then(progress => {
        this.updateProgress = false;
        this.progress = progress;
        this.progressXhr = xhr;
      });
  }

  public getProgress() {
    if (!this.progress) return false;
    return this.progress;
  }

  public getProgressFormated() {
    const op: {
      label: string;
      key: string;
      state: 'complete' | 'ongoing' | 'dropped' | 'discontinued';
      type: 'dub' | 'sub';
      dropped: boolean;
      episode: Number;
      lastEp?: {
        total: number;
        timestamp?: number;
      };
      predicition?: {
        timestamp: number;
        probability: 'low' | 'medium' | 'high';
      };
    }[] = [];
    const languageNames = new Intl.DisplayNames('en', { type: 'language' });
    con.log(this.progressXhr);
    if (this.progressXhr && Object.keys(this.progressXhr).length) {
      this.progressXhr.forEach(el => {
        op.push({
          type: el.type,
          key: el.id,
          state: el.state,
          label: languageNames.of(el.lang.replace(/^jp$/, 'ja')) || el.lang,
          dropped: el.state === 'dropped' || el.state === 'discontinued',
          episode: el.lastEp && el.lastEp.total ? el.lastEp.total : 0,
          lastEp: el.lastEp,
          predicition: el.prediction,
        });
      });
    }
    return op;
  }

  public getProgressOptions() {
    return this.getProgressFormated().filter(el => el.state !== 'complete');
  }

  public getProgressCompleted() {
    return this.getProgressFormated().filter(el => el.state === 'complete');
  }

  private updateProgress = false;

  public getProgressMode(): string {
    if (this.options && this.options.p) {
      return this.options.p;
    }

    return '';
  }

  public setProgressMode(mode: string): void {
    if (this.options) {
      this.options.p = mode;
      this.updateProgress = true;
    }
    if (!api.settings.get('malTags')) {
      utils
        .setEntrySettings(this.type, this.getCacheKey(), this.options, this._getTags())
        .then(() => this.initProgress());
    }
  }

  public getProgressKey() {
    let mode = this.getProgressMode();

    if (!mode) {
      if (this.getType() === 'anime') {
        mode = api.settings.get('progressIntervalDefaultAnime');
      } else {
        mode = api.settings.get('progressIntervalDefaultManga');
      }
    }

    if (!mode) return null;

    const res = /^([^/]*)\/(.*)$/.exec(mode);

    if (!res) return null;

    return {
      key: mode,
      lang: res[1],
      type: res[2],
    };
  }

  public getPageRelations(): { name: string; icon: string; link: string }[] {
    const name = this.shortName;
    const res: { name: string; icon: string; link: string }[] = [];

    if (this.ids.mal && name !== 'MAL') {
      res.push({
        name: 'MAL',
        icon: 'https://cdn.myanimelist.net/images/favicon.ico',
        link: `https://myanimelist.net/${this.type}/${this.ids.mal}`,
      });
    }

    if (this.ids.ani && name !== 'AniList') {
      res.push({
        name: 'AniList',
        icon: 'https://anilist.co/img/icons/favicon-32x32.png',
        link: `https://anilist.co/${this.type}/${this.ids.ani}`,
      });
    }

    if (this.ids.kitsu.id && name !== 'Kitsu') {
      res.push({
        name: 'Kitsu',
        icon: 'https://kitsu.io/favicon-32x32-3e0ecb6fc5a6ae681e65dcbc2bdf1f17.png',
        link: `https://kitsu.io/${this.type}/${this.ids.kitsu.id}`,
      });
    }

    if (this.ids.simkl && name !== 'Simkl') {
      res.push({
        name: 'Simkl',
        icon: 'https://eu.simkl.in/img_favicon/v2/favicon-32x32.png',
        link: `https://simkl.com/${this.type}/${this.ids.simkl}`,
      });
    }

    return res;
  }

  public fillRelations(): Promise<void> {
    return Promise.resolve();
  }

  abstract _update(): Promise<void>;

  public update(): Promise<void> {
    this.logger.log('[SINGLE]', 'Update info', this.ids);
    this.lastError = null;
    return this._update()
      .catch(e => {
        this.lastError = e;
        throw e;
      })
      .then(() => {
        this.persistanceState = this.getStateEl();

        return utils.getEntrySettings(this.type, this.getCacheKey(), this._getTags());
      })
      .then(options => {
        this.options = options;
        this.registerEvent();
        this.emitUpdate('state');
      });
  }

  abstract _sync(): Promise<void>;

  public async sync(): Promise<void> {
    this.logger.log('[SINGLE]', 'Sync', this.ids);
    this.lastError = null;
    this._setTags(
      await utils.setEntrySettings(this.type, this.getCacheKey(), this.options, this._getTags()),
    );
    return this._sync()
      .catch(e => {
        this.lastError = e;
        throw e;
      })
      .then(() => {
        this.undoState = this.persistanceState;
        if (this.updateProgress) this.initProgress();
        this._onList = true;
        this.emitUpdate();
      });
  }

  public emitUpdate(action: 'update' | 'state' = 'update') {
    globalEmit(`${action}.${this.getCacheKey()}`, {
      id: this.getPageId(),
      type: this.getType(),
      cacheKey: this.getCacheKey(),
      state: this.getStateEl(),
      meta: {
        title: this.getTitle(),
        image: this.getImage(),
        malId: this.getMalId(),
        totalEp: this.getTotalEpisodes(),
        url: this.getUrl(),
      },
    });
  }

  abstract _delete(): Promise<void>;

  public async delete(): Promise<void> {
    return this._delete().then(() => {
      this._onList = false;
      globalEmit(`delete.${this.getCacheKey()}`, {
        id: this.getPageId(),
        type: this.getType(),
        cacheKey: this.getCacheKey(),
      });
    });
  }

  protected globalUpdateEvent;

  protected registerEvent() {
    if (!this.globalUpdateEvent) {
      this.globalUpdateEvent = emitter.on(`update.${this.getCacheKey()}`, data =>
        this.updateEvent(data),
      );
    }
  }

  protected updateEvent(data) {
    if (this.isDirty()) {
      this.logger.log('Ignore event');
      return;
    }

    if (data && data.state) {
      this.setStateEl(data.state);
      this.persistanceState = this.getStateEl();
      emitter.emit('syncPage_fillUi');
    }
  }

  public isDirty(): boolean {
    return (
      JSON.stringify(this.persistanceState) !== JSON.stringify(this.getStateEl()) ||
      this.updateProgress
    );
  }

  public undo(): Promise<void> {
    this.logger.log('[SINGLE]', 'Undo', this.undoState);
    if (!this.undoState) throw new SafeError('No undo state found');
    if (!this.undoState.onList) {
      // @ts-ignore
      if (typeof this.delete === 'undefined') throw new Error('Deleting an entry is not supported');
      // @ts-ignore
      return this.delete().then(() => {
        this.setStateEl(this.undoState);
        this.undoState = null;
      });
    }
    this.setStateEl(this.undoState);
    return this.sync().then(() => {
      this.undoState = null;
    });
  }

  abstract _getTitle(raw: boolean): string;

  public getTitle(raw = false) {
    return this._getTitle(raw);
  }

  abstract _getTotalEpisodes(): number;

  public getTotalEpisodes() {
    let eps = this._getTotalEpisodes();
    if (!eps) eps = 0;
    return eps;
  }

  abstract _getTotalVolumes(): number;

  public getTotalVolumes() {
    return this._getTotalVolumes();
  }

  protected _onList = false;

  public isOnList() {
    return this._onList;
  }

  protected _authenticated = false;

  public isAuthenticated() {
    return this._authenticated;
  }

  abstract _getDisplayUrl(): string;

  public getDisplayUrl(): string {
    return this._getDisplayUrl();
  }

  public getMalUrl(): string | null {
    if (!Number.isNaN(this.ids.mal)) {
      return `https://myanimelist.net/${this.getType()}/${this.ids.mal}`;
    }
    return null;
  }

  public getMalId(): number | null {
    if (!Number.isNaN(this.ids.mal)) {
      return this.ids.mal;
    }
    return null;
  }

  public getIds() {
    return this.ids;
  }

  abstract _getImage(): string;

  public getImage(): string {
    return this._getImage();
  }

  public setImage?(url: string): void;

  abstract _getRating(): Promise<string>;

  public getRating(): Promise<string> {
    return this._getRating().then(rating => {
      if (!rating) return 'N/A';
      return rating;
    });
  }

  public setResumeWatching(url: string, ep: number) {
    return utils.setResumeWaching(url, ep, this.type, this.getCacheKey());
  }

  public getResumeWatching(): { url: string; ep: number } | null {
    if (this.options && this.options.r) return this.options.r;
    return null;
  }

  public setContinueWatching(url: string, ep: number) {
    return utils.setContinueWaching(url, ep, this.type, this.getCacheKey());
  }

  public getContinueWatching(): { url: string; ep: number } | null {
    if (this.options && this.options.c) return this.options.c;
    return null;
  }

  public increaseRewatchCount(): void {
    //  do nothing
  }

  getStateEl() {
    return {
      onList: this.isOnList(),
      episode: this.getEpisode(),
      volume: this.getVolume(),
      status: this.getStatus(),
      score: this.getScore(),
      absoluteScore: this.getAbsoluteScore(),
    };
  }

  setStateEl(state) {
    this._onList = state.onList;
    this.setEpisode(state.episode);
    this.setVolume(state.volume);
    this.setStatus(state.status);
    this.setScore(state.score);
    if (state.absoluteScore) this.setAbsoluteScore(state.absoluteScore);
  }

  getStateDiff() {
    const persistance = this.getStateEl();
    if (persistance && this.undoState) {
      const diff: any = {};
      for (const key in persistance) {
        if (persistance[key] !== this.undoState[key]) {
          diff[key] = persistance[key];
        }
      }
      return diff;
    }
    return undefined;
  }

  public async checkSync(episode: number, volume?: number): Promise<boolean> {
    const curEpisode = this.getEpisode();
    const curStatus = this.getStatus();
    const curVolume = this.getVolume();

    if (curStatus === definitions.status.Completed) {
      if (episode === 1) {
        return this.startRewatchingMessage();
      }
      return false;
    }

    if (
      curEpisode >= episode &&
      // Novel Volume
      !(
        typeof volume !== 'undefined' &&
        (curVolume || volume > 1 || !episode) &&
        volume > curVolume
      )
    ) {
      return false;
    }

    if (episode && episode === this.getTotalEpisodes()) {
      if (curStatus === definitions.status.Rewatching) {
        await this.finishRewatchingMessage();
      } else {
        await this.finishWatchingMessage();
      }
      return true;
    }

    if (curStatus !== definitions.status.Watching && curStatus !== definitions.status.Rewatching) {
      return this.startWatchingMessage();
    }

    return true;
  }

  public async startWatchingMessage() {
    return utils
      .flashConfirm(api.storage.lang(`syncPage_flashConfirm_start_${this.getType()}`), 'add')
      .then(res => {
        if (res) this.setStatus(definitions.status.Watching);
        return res;
      });
  }

  public async finishWatchingMessage(): Promise<boolean> {
    const currentScore = this.getScoreCheckboxValue();

    let checkHtml =
      '<div><select id="finish_score" style="margin-top:5px; color:white; background-color:#4e4e4e; border: none;">';
    this.getScoreCheckbox().forEach(el => {
      checkHtml += `<option value="${el.value}" ${currentScore === el.value ? 'selected' : ''}>${
        el.label
      }</option>`;
    });
    checkHtml += '</select></div>';

    return utils
      .flashConfirm(api.storage.lang('syncPage_flashConfirm_complete') + checkHtml, 'complete')
      .then(res => {
        if (res) {
          this.setStatus(definitions.status.Completed);
          const finishScore = Number(j.$('#finish_score').val());
          if (finishScore > 0) {
            this.logger.log(`finish_score: ${j.$('#finish_score :selected').val()}`);
            this.handleScoreCheckbox(j.$('#finish_score :selected').val());
          }
        }

        return res;
      });
  }

  public async startRewatchingMessage(): Promise<boolean> {
    return utils
      .flashConfirm(
        api.storage.lang(`syncPage_flashConfirm_rewatch_start_${this.getType()}`),
        'add',
      )
      .then(res => {
        if (res) this.setStatus(definitions.status.Rewatching);
        return res;
      });
  }

  public async finishRewatchingMessage(): Promise<boolean> {
    return utils
      .flashConfirm(
        api.storage.lang(`syncPage_flashConfirm_rewatch_finish_${this.getType()}`),
        'complete',
      )
      .then(res => {
        if (res) {
          this.setStatus(definitions.status.Completed);
          this.increaseRewatchCount();
        }
        return res;
      });
  }

  public getScoreCheckbox() {
    return this.getScoreMode().getOptions();
  }

  public getScoreCheckboxValue() {
    return this.getScoreMode().valueToOptionValue(this.getAbsoluteScore());
  }

  public handleScoreCheckbox(value) {
    this.setAbsoluteScore(this.getScoreMode().optionValueToValue(value));
  }

  public getDisplayScoreCheckbox() {
    const curScore = this.getScoreCheckboxValue();
    const labelEl = this.getScoreCheckbox().filter(el => el.value === curScore);
    if (labelEl.length) return labelEl[0].label;
    return '';
  }

  public getStatusCheckbox() {
    const statusEs = [
      {
        value: '1',
        label: api.storage.lang(`UI_Status_watching_${this.getType()}`),
      },
      { value: '2', label: api.storage.lang('UI_Status_Completed') },
      { value: '3', label: api.storage.lang('UI_Status_OnHold') },
      { value: '4', label: api.storage.lang('UI_Status_Dropped') },
      {
        value: '6',
        label: api.storage.lang(`UI_Status_planTo_${this.getType()}`),
      },
    ];

    if (this.rewatchingSupport) {
      statusEs.push({
        value: '23',
        label: api.storage.lang(`UI_Status_Rewatching_${this.getType()}`),
      });
    }

    return statusEs;
  }

  public handleStatusCheckbox(value) {
    this.setStatus(value);
  }

  public getStatusCheckboxValue() {
    return this.getStatus();
  }

  public getKey(allowed: SyncTypes[], forceMal = true) {
    if (forceMal && this.ids.mal) return this.ids.mal;
    if (this.ids.ani && allowed.includes('ANILIST')) return `anilist:${this.ids.ani}`;
    if (this.ids.kitsu.id && allowed.includes('KITSU')) return `kitsu:${this.ids.kitsu.id}`;
    if (this.ids.simkl && allowed.includes('SIMKL')) return `simkl:${this.ids.simkl}`;
    return this.ids.mal;
  }

  public getLastError() {
    return this.lastError;
  }

  public getLastErrorMessage() {
    return this.errorMessage(this.getLastError());
  }

  flashmError(error) {
    utils.flashm(this.errorMessage(error), { error: true, type: 'error' });
  }

  errorMessage(error) {
    return _errorMessage(error, this.authenticationUrl);
  }
}
