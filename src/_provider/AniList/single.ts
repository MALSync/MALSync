import {SingleAbstract} from './../singleAbstract';
import * as helper from "./helper";
import {errorCode} from "./../defintions";

export class Single extends SingleAbstract {
  protected data = {
    status: 4,
    score: 4,
    episode: 4,
    volume: 4,
  }

  private animeInfo: any;

  private displayUrl: string = '';

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
    throw this.errorObj(errorCode.UrlNotSuported, 'Url not supported')
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

  _getDisplayUrl() {
    return this.displayUrl !== '' && this.displayUrl != null ? this.displayUrl : this.url;
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
      type: this.type!.toUpperCase()
    };

    return this.apiCall(query, variables).then(json => {
      con.log('[SINGLE]','Data',json);

      this.animeInfo = json.data.Media;

      this.ids.ani = this.animeInfo.id;
      if(isNaN(this.ids.mal) && this.animeInfo.idMal){
        this.ids.mal = this.animeInfo.idMal;
      }

      this.displayUrl = this.animeInfo.siteUrl;
      this._onList = true;
      if(this.animeInfo.mediaListEntry === null){
        this._onList = false;
        this.animeInfo.mediaListEntry = {
          notes: "",
          progress: 0,
          progressVolumes: 0,
          repeat: 0,
          score: 0,
          status: 'PLANNING'
        }
      }

    });
  }

  protected apiCall(query, variables) {
    return api.request.xhr('POST', {
      url: 'https://graphql.anilist.co',
      headers: {
        'Authorization': 'Bearer ' + api.settings.get('anilistToken'),
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      data: JSON.stringify({
        query,
        variables
      })
    }).then((response) => {
      if(response.status > 499 && response.status < 600) {
        throw this.errorObj(errorCode.ServerOffline, 'Server Offline status: '+response.status)
      }

      //TODO: error handling
      var res = JSON.parse(response.responseText);
      return res;
    })
  }
}
