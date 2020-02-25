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

    this._authenticated = true;

    return this.apiCall(query, variables)
      .catch(e => {
        if(e.code === errorCode.NotAutenticated){
          this._authenticated = false;
          return this.apiCall(query, variables, false);
        }
        throw e;
      }).then(json => {
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

        if(!this._authenticated) throw this.errorObj(errorCode.NotAutenticated, 'Not Authenticated');
      });
  }

  protected apiCall(query, variables, authentication = true) {
    var headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
    if(authentication) headers['Authorization'] = 'Bearer ' + api.settings.get('anilistToken')
    return api.request.xhr('POST', {
      url: 'https://graphql.anilist.co',
      headers,
      data: JSON.stringify({
        query,
        variables
      })
    }).then((response) => {
      if(response.status > 499 && response.status < 600) {
        throw this.errorObj(errorCode.ServerOffline, 'Server Offline status: '+response.status)
      }

      var res = JSON.parse(response.responseText);

      if(typeof res.errors != 'undefined' && res.errors.length){
        con.error('[SINGLE]','Error',res.errors);
        var error = res.errors[0];
        switch(error.status) {
          case 400:
            throw this.errorObj(errorCode.NotAutenticated, error.message);
            break;
          case 404:
            throw this.errorObj(errorCode.EntryNotFound, error.message);
            break;
          default:
            throw this.errorObj(error.status, error.message);
        }
      }

      return res;
    })
  }
}
