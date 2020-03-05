import {SingleAbstract} from './../singleAbstract';
import * as helper from "./helper";
import {errorCode} from "./../definitions";

export class Single extends SingleAbstract {

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

  getCacheKey(){
    return helper.getCacheKey(this.ids.mal, this.ids.ani);
  }

  _getStatus() {
    return parseInt(helper.statusTranslate[this.animeInfo.mediaListEntry.status]);
  }

  _setStatus(status) {
    this.animeInfo.mediaListEntry.status = helper.statusTranslate[status];
  }

  _getScore() {
    if(this.animeInfo.mediaListEntry.score === 0) return 0;
    var score = Math.round(this.animeInfo.mediaListEntry.score / 10);
    if(score === 0) return 1;
    return score;
  }

  _setScore(score) {
    this.animeInfo.mediaListEntry.score = score * 10;
  }

  _getEpisode() {
    return this.animeInfo.mediaListEntry.progress;
  }

  _setEpisode(episode) {
    this.animeInfo.mediaListEntry.progress = parseInt(episode+'');
  }

  _getVolume() {
    return this.animeInfo.mediaListEntry.progressVolumes;
  }

  _setVolume(volume) {
    this.animeInfo.mediaListEntry.progressVolumes = volume;
  }

  _getStreamingUrl() {
    var tags = this.animeInfo.mediaListEntry.notes;
    return utils.getUrlFromTags(tags);
  }

  _setStreamingUrl(url) {
    var tags = this.animeInfo.mediaListEntry.notes;
    if(tags == null || tags == 'null') tags = '';

    tags = utils.setUrlInTags(url, tags);

    this.animeInfo.mediaListEntry.notes = tags;
  }

  _getTitle() {
    return this.animeInfo.title.userPreferred;
  }

  _getTotalEpisodes() {
    var eps = this.animeInfo.episodes? this.animeInfo.episodes: this.animeInfo.chapters;
    if(eps == null) return 0;
    return eps;
  }

  _getTotalVolumes() {
    var vol = this.animeInfo.volumes;
    if(!vol) return 0;
    return vol;
  }

  _getDisplayUrl() {
    return this.displayUrl !== '' && this.displayUrl != null ? this.displayUrl : this.url;
  }

  _getImage() {
    return this.animeInfo.coverImage.large;
  }

  _getRating() {
    return this.animeInfo.averageScore;
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

  _sync() {
    var query = `
      mutation ($mediaId: Int, $status: MediaListStatus, $progress: Int, $scoreRaw: Int, $notes: String) {
        SaveMediaListEntry (mediaId: $mediaId, status: $status, progress: $progress, scoreRaw: $scoreRaw, notes: $notes) {
          id
          status
          progress
        }
      }
    `;
    ​
    var variables = {
      "mediaId": this.ids.ani,
      "status": this.animeInfo.mediaListEntry.status,
      "progress": this.animeInfo.mediaListEntry.progress,
      "scoreRaw": this.animeInfo.mediaListEntry.score,
      "notes": this.animeInfo.mediaListEntry.notes
    };

    if(this.type == 'manga'){
      query = `
        mutation ($mediaId: Int, $status: MediaListStatus, $progress: Int, $scoreRaw: Int, $notes: String, $volumes: Int) {
          SaveMediaListEntry (mediaId: $mediaId, status: $status, progress: $progress, scoreRaw: $scoreRaw, notes: $notes, progressVolumes: $volumes) {
            id
            status
            progress
            progressVolumes
          }
        }
      `;
      variables['volumes'] = this.animeInfo.mediaListEntry.progressVolumes;
    }

    return this.apiCall(query, variables);
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
