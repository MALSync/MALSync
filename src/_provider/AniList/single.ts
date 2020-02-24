import {SingleAbstract} from './../singleAbstract';
import * as helper from "./helper";

export class Single extends SingleAbstract {
  protected data = {
    status: 4,
    score: 4,
    episode: 4,
    volume: 4,
  }

  protected handleUrl(url) {
    if(url.match(/anilist\.co\/(anime|manga)\/\d*/i)) {
      this.type = utils.urlPart(url, 3);
      this.ids.ani = utils.urlPart(url, 4);
      return;
    }
    if(url.match(/myanimelist\.net\/(anime|manga)\/\d*/i)) {
      this.type = utils.urlPart(url, 3);
      this.ids.mal = utils.urlPart(url, 4);
      return;
    }
    throw 'Url not supported';
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

  _update() {
    var selectId = this.ids.mal;
    var selectQuery = 'idMal';
    if(isNaN(this.ids.mal)){
      selectId = this.ids.ani;
      selectQuery = 'id';
    }

    var query = `
    query ($id: Int, $type: MediaType) {
      Media (${selectQuery}: $id, type: $type) {
        id
        idMal
        siteUrl
        episodes
        chapters
        volumes
        averageScore
        coverImage{
          large
        }
        title {
          userPreferred
        }
        mediaListEntry {
          status
          progress
          progressVolumes
          score(format: POINT_100)
          repeat
          notes
        }
      }
    }
    `;
    ​
    var variables = {
      id: selectId,
      type: this.type.toUpperCase()
    };

  }
}
