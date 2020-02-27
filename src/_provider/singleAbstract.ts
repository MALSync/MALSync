import * as defintions from './defintions';

export abstract class SingleAbstract {

  constructor(
    protected url: string
  ) {
    this.handleUrl(url);
    return this;
  }

  protected type: defintions.type|null = null;

  protected ids = {
    mal: NaN,
    ani: NaN,
    kitsu: NaN,
    simkl: NaN,
  };

  protected abstract handleUrl(url: string);

  public getType() {
    return this.type
  }

  public abstract getCacheKey();

  abstract _setStatus(status: defintions.status): void;
  public setStatus(status: defintions.status): void {
    return this._setStatus(status);
  };

  abstract _getStatus(): defintions.status;
  public getStatus(): defintions.status {
    return this._getStatus();
  };

  abstract _setScore(score: defintions.score): void;
  public setScore(score: defintions.score): void {
    return this._setScore(score);
  };

  abstract _getScore(): defintions.score;
  public getScore(): defintions.score {
    return this._getScore();
  };

  abstract _setEpisode(episode: number): void;
  public setEpisode(episode: number): void {
    return this._setEpisode(episode);
  };

  abstract _getEpisode(): number;
  public getEpisode(): number {
    return this._getEpisode();
  };

  abstract _setVolume(volume: number): void;
  public setVolume(volume: number): void {
    return this._setVolume(volume);
  };

  abstract _getVolume(): number;
  public getVolume(): number {
    return this._getVolume();
  };

  abstract _setStreamingUrl(streamingUrl: string): void;
  public setStreamingUrl(streamingUrl: string): void {
    return this._setStreamingUrl(streamingUrl);
  };

  abstract _getStreamingUrl(): string;
  public getStreamingUrl(): string {
    return this._getStreamingUrl();
  };

  abstract _update(): Promise<void>;
  public update(): Promise<void> {
    con.log('[SINGLE]','Update info', this.ids);
    return this._update();
  };

  abstract _getTitle(): string;
  public getTitle() {
    return this._getTitle();
  }

  abstract _getTotalEpisodes(): number;
  public getTotalEpisodes() {
    return this._getTotalEpisodes();
  }

  abstract _getTotalVolumes(): number;
  public getTotalVolumes() {
    return this._getTotalVolumes();
  }

  protected _onList: boolean = false;
  public isOnList() {
    return this._onList;
  }

  protected _authenticated: boolean = false;
  public isAuthenticated() {
    return this._authenticated;
  }

  abstract _getDisplayUrl(): string;
  public getDisplayUrl(): string{
    return this._getDisplayUrl();
  }

  public getMalUrl(): string|null{
    if(!isNaN(this.ids.mal)){
      return 'https://myanimelist.net/'+this.getType()+'/'+this.ids.mal+'/'+encodeURIComponent(this.getTitle().replace(/\//,'_'));
    }
    return null;
  }

  abstract _getImage(): Promise<string>|string;
  public getImage(): Promise<string>|string{
    return this._getImage();
  }

  abstract _getRating(): Promise<string>|string;
  public getRating(): Promise<string>|string{
    var rating = this._getRating();
    if(!rating) return 'N/A';
    return rating;
  }

  protected errorObj(code: defintions.errorCode, message): defintions.error {
    return {
      code,
      message,
    }
  }

}
