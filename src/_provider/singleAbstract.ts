import defintions from './defintions';

export abstract class SingleAbstract {

  constructor(
    protected url: string
  ) {
    this.handleUrl(url);
    return this;
  }

  readonly type: defintions.type;

  abstract protected handleUrl(url: string);

  abstract _setStatus(status: defintions.status): void;
  public setStatus(status: defintions.status): void {
    return this._setStatus(status);
  };

  abstract _getStatus(): defintions.status;
  public getStatus(): defintions.status {
    return this._getStatus();
  };

  abstract _setScore(score: defintions.Score): void;
  public setScore(score: defintions.Score): void {
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

}
