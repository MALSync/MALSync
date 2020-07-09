import * as definitions from './definitions';

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

  abstract _setScore(score: definitions.score): void;

  public setScore(score: definitions.score): SingleAbstract {
    score = parseInt(`${score}`);
    if (!score) score = 0;
    this._setScore(score);
    return this;
  }

  abstract _getScore(): definitions.score;

  public getScore(): definitions.score {
    const score = this._getScore();
    if (!score) return 0;
    return score;
  }

  abstract _setEpisode(episode: number): void;

  public setEpisode(episode: number): SingleAbstract {
    episode = parseInt(`${episode}`);
    if (this.getTotalEpisodes() && episode > this.getTotalEpisodes()) episode = this.getTotalEpisodes();
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
      });
  }

  abstract _sync(): Promise<void>;

  public async sync(): Promise<void> {
    this.logger.log('[SINGLE]', 'Sync', this.ids);
    this.lastError = null;
    this._setTags(await utils.setEntrySettings(this.type, this.getCacheKey(), this.options, this._getTags()));
    return this._sync()
      .catch(e => {
        this.lastError = e;
        throw e;
      })
      .then(() => {
        this.undoState = this.persistanceState;
      });
  }

  public undo(): Promise<void> {
    this.logger.log('[SINGLE]', 'Undo', this.undoState);
    if (!this.undoState) throw new Error('No undo state found');
    this.setStateEl(this.undoState);
    return this.sync().then(() => {
      this.undoState = null;
    });
  }

  abstract _getTitle(): string;

  public getTitle() {
    return this._getTitle();
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
      return `https://myanimelist.net/${this.getType()}/${this.ids.mal}/${encodeURIComponent(
        this.getTitle().replace(/\//, '_'),
      )}`;
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

  abstract _getImage(): Promise<string>;

  public getImage(): Promise<string> {
    return this._getImage();
  }

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

  getStateEl() {
    return {
      episode: this.getEpisode(),
      volume: this.getVolume(),
      status: this.getStatus(),
      score: this.getScore(),
    };
  }

  setStateEl(state) {
    this.setEpisode(state.episode);
    this.setVolume(state.volume);
    this.setStatus(state.status);
    this.setScore(state.score);
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

  public async checkSync(episode: number, volume?: number, isNovel = false): Promise<boolean> {
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
      !(isNovel && typeof volume !== 'undefined' && volume > curVolume)
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
    return utils.flashConfirm(api.storage.lang(`syncPage_flashConfirm_start_${this.getType()}`), 'add').then(res => {
      if (res) this.setStatus(definitions.status.Watching);
      return res;
    });
  }

  public async finishWatchingMessage(): Promise<boolean> {
    const currentScore = this.getScoreCheckboxValue();

    let checkHtml =
      '<div><select id="finish_score" style="margin-top:5px; color:white; background-color:#4e4e4e; border: none;">';
    this.getScoreCheckbox().forEach(el => {
      checkHtml += `<option value="${el.value}" ${String(currentScore) === el.value ? 'selected' : ''}>${
        el.label
      }</option>`;
    });
    checkHtml += '</select></div>';

    return utils.flashConfirm(api.storage.lang('syncPage_flashConfirm_complete') + checkHtml, 'complete').then(res => {
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
      .flashConfirm(api.storage.lang(`syncPage_flashConfirm_rewatch_start_${this.getType()}`), 'add')
      .then(res => {
        if (res) this.setStatus(definitions.status.Rewatching);
        return res;
      });
  }

  public async finishRewatchingMessage(): Promise<boolean> {
    return utils
      .flashConfirm(api.storage.lang(`syncPage_flashConfirm_rewatch_finish_${this.getType()}`), 'complete')
      .then(res => {
        if (res) this.setStatus(definitions.status.Completed);
        return res;
      });
  }

  public getScoreCheckbox() {
    return [
      { value: '0', label: api.storage.lang('UI_Score_Not_Rated') },
      { value: '10', label: api.storage.lang('UI_Score_Masterpiece') },
      { value: '9', label: api.storage.lang('UI_Score_Great') },
      { value: '8', label: api.storage.lang('UI_Score_VeryGood') },
      { value: '7', label: api.storage.lang('UI_Score_Good') },
      { value: '6', label: api.storage.lang('UI_Score_Fine') },
      { value: '5', label: api.storage.lang('UI_Score_Average') },
      { value: '4', label: api.storage.lang('UI_Score_Bad') },
      { value: '3', label: api.storage.lang('UI_Score_VeryBad') },
      { value: '2', label: api.storage.lang('UI_Score_Horrible') },
      { value: '1', label: api.storage.lang('UI_Score_Appalling') },
    ];
  }

  public getScoreCheckboxValue() {
    return this.getScore();
  }

  public handleScoreCheckbox(value) {
    this.setScore(value);
  }

  public getDisplayScoreCheckbox() {
    const curScore = this.getScoreCheckboxValue();
    const labelEl = this.getScoreCheckbox().filter(el => el.value === String(curScore));
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

  public getLastError() {
    return this.lastError;
  }

  public getLastErrorMessage() {
    return this.errorMessage(this.getLastError());
  }

  protected errorObj(code: definitions.errorCode, message): definitions.error {
    return {
      code,
      message,
    };
  }

  flashmError(error) {
    utils.flashm(this.errorMessage(error), { error: true, type: 'error' });
  }

  errorMessage(error) {
    if (typeof error.code === 'undefined') {
      return error;
    }

    switch (error.code) {
      case definitions.errorCode.NotAutenticated:
        return api.storage.lang('Error_Authenticate', [this.authenticationUrl]);
        break;
      case definitions.errorCode.ServerOffline:
        return `[${this.shortName}] Server Offline`;
        break;
      case definitions.errorCode.UrlNotSuported:
        return 'Incorrect url provided';
        break;
      case definitions.errorCode.EntryNotFound:
        return `Entry for this ${this.getType()} could not be found on ${this.shortName}`;
        break;
      default:
        return error.message;
        break;
    }
  }
}
