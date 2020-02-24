import {SingleAbstract} from './../singleAbstract';
import * as helper from "./helper";

export class Single extends SingleAbstract {
  protected data = {
    status: 4,
    score: 4,
    episode: 4,
    volume: 4,
  }

  _getStatus() {
    return this.data.status;
  }

  _setStatus(status) {
    this.data.status = status;
  }

  _getScore() {
    return this.data.score;
  }

  _setScore(score) {
    this.data.score = score;
  }

  _getEpisode() {
    return this.data.episode;
  }

  _setEpisode(episode) {
    this.data.episode = episode;
  }

  _getVolume() {
    return this.data.volume;
  }

  _setVolume(volume) {
    this.data.volume = volume;
  }
}
