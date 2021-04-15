/*
import { SingleAbstract } from '../singleAbstract';
import { errorCode } from '../definitions';
import { malToAnilist } from '../AniList/helper';
import { Cache } from '../../utils/Cache';

export class Single extends SingleAbstract {
  constructor(protected url: string) {
    super(url);
    this.logger = con.m(this.shortName, '#2e51a2');
    return this;
  }

  private animeInfo: any;

  private displayUrl = '';

  private additionalInfo = {
    name: 'Unknown',
    totalEp: 0,
    totalVol: 0,
  };

  private pending = false;

  shortName = 'MAL';

  authenticationUrl = 'https://myanimelist.net/login.php';

  protected handleUrl(url) {
    if (url.match(/myanimelist\.net\/(anime|manga)\/\d*\/i)) {
      this.type = utils.urlPart(url, 3) === 'anime' ? 'anime' : 'manga';
      this.ids.mal = Number(utils.urlPart(url, 4));
      return;
    }
    throw this.errorObj(errorCode.UrlNotSuported, 'Url not supported');
  }

  getCacheKey() {
    return this.ids.mal;
  }

  _getStatus() {
    let curSt;
    if (this.type === 'manga') {
      curSt = this.animeInfo['.add_manga[status]'];
    } else {
      curSt = this.animeInfo['.add_anime[status]'];
    }
    if (this.getRewatching() && curSt === 2) return 23;
    return curSt;
  }

  _setStatus(status) {
    if (status === 23) {
      status = 2;
      this.setRewatching(true);
    } else {
      this.setRewatching(false);
    }
    if (this.type === 'manga') {
      this.animeInfo['.add_manga[status]'] = status;
    }
    this.animeInfo['.add_anime[status]'] = status;
  }

  _getScore() {
    if (this.type === 'manga') {
      return this.animeInfo['.add_manga[score]'];
    }
    return this.animeInfo['.add_anime[score]'];
  }

  _setScore(score) {
    // @ts-ignore
    if (!score) score = '';
    if (this.type === 'manga') {
      this.animeInfo['.add_manga[score]'] = score;
    }
    this.animeInfo['.add_anime[score]'] = score;
  }

  _getEpisode() {
    if (this.type === 'manga') {
      return this.animeInfo['.add_manga[num_read_chapters]'];
    }
    return this.animeInfo['.add_anime[num_watched_episodes]'];
  }

  _setEpisode(episode) {
    if (!episode) episode = 0;
    if (this.type === 'manga') {
      this.animeInfo['.add_manga[num_read_chapters]'] = parseInt(`${episode}`);
    }
    this.animeInfo['.add_anime[num_watched_episodes]'] = parseInt(`${episode}`);
  }

  _getVolume() {
    if (this.type === 'manga') {
      return this.animeInfo['.add_manga[num_read_volumes]'];
    }
    return 0;
  }

  _setVolume(volume) {
    if (this.type === 'manga') {
      this.animeInfo['.add_manga[num_read_volumes]'] = volume;
    }
  }

  _getTags() {
    let tags = this.animeInfo['.add_anime[tags]'];
    if (this.type === 'manga') {
      tags = this.animeInfo['.add_manga[tags]'];
    }
    if (!tags) tags = '';
    return tags;
  }

  _setTags(tags) {
    if (this.type === 'manga') {
      this.animeInfo['.add_manga[tags]'] = tags;
      return;
    }
    this.animeInfo['.add_anime[tags]'] = tags;
  }

  private getRewatching(): boolean {
    if (this.type === 'manga') {
      return this.animeInfo['.add_manga[is_rereading]'];
    }
    return this.animeInfo['.add_anime[is_rewatching]'];
  }

  private setRewatching(state: boolean) {
    let sState = 0;
    if (state) sState = 1;
    if (this.type === 'manga') {
      this.animeInfo['.add_manga[is_rereading]'] = sState;
      return;
    }
    this.animeInfo['.add_anime[is_rewatching]'] = sState;
  }

  _getTitle() {
    if (this.additionalInfo.name === 'manga database') return 'Pending Title';
    return this.additionalInfo.name;
  }

  _getTotalEpisodes() {
    return this.additionalInfo.totalEp;
  }

  _getTotalVolumes() {
    return this.additionalInfo.totalVol;
  }

  _getDisplayUrl() {
    return this.url;
  }

  _getImage() {
    return this.apiCall('GET', this.url).then(data => {
      let image = '';
      try {
        image = data
          .split('property="og:image"')[1]
          .split('content="')[1]
          .split('"')[0];
      } catch (e) {
        console.log('[mal.ts] Error:', e);
      }
      return image;
    });
  }

  _getRating() {
    let url = '';
    if (this.type === 'anime') {
      url = `https://myanimelist.net/includes/ajax.inc.php?t=64&id=${this.ids.mal}`;
    } else {
      url = `https://myanimelist.net/includes/ajax.inc.php?t=65&id=${this.ids.mal}`;
    }

    return this.apiCall('GET', url).then(data => {
      return data.split('Score:</span>')[1].split('<')[0];
    });
  }

  async _update() {
    const editUrl = `https://myanimelist.net/ownlist/${this.type}/${this.ids.mal}/edit?hideLayout`;
    this.logger.log('Update MAL info', editUrl);
    return this.apiCall('GET', editUrl).then(data => {
      this._authenticated = true;
      this.animeInfo = this.getObject(data);
    });
  }

  async _sync() {
    let url = `https://myanimelist.net/ownlist/${this.type}/${this.ids.mal}/edit`;
    if (this.pending) {
      throw this.errorObj(
        errorCode.GenericError,
        `This ${this.type} is currently pending approval. It can´t be saved to mal for now`,
      );
    }

    if (!this._onList) {
      if (this.type === 'anime') {
        url = `https://myanimelist.net/ownlist/anime/add?selected_series_id=${this.ids.mal}`;
      } else {
        url = `https://myanimelist.net/ownlist/manga/add?selected_manga_id=${this.ids.mal}`;
      }
    }

    if (this._getStatus() === 1 && this.getEpisode() > 0) {
      this.setStartingDateToNow();
    }

    if (this._getStatus() === 2) {
      this.setCompletionDateToNow();
      this.setStartingDateToNow();
      if (this.getTotalEpisodes()) this.setEpisode(this.getTotalEpisodes());
    }

    let parameter = '';
    j.$.each(this.animeInfo, function(index, value) {
      if (index.toString().charAt(0) === '.') {
        if (
          !((index === '.add_anime[is_rewatching]' || index === '.add_manga[is_rereading]') && parseInt(value) === 0)
        ) {
          parameter += `${encodeURIComponent(index.toString().substring(1))}=${encodeURIComponent(value)}&`;
        }
      }
    });
    this.logger.log('[SET] URL:', url);
    this.logger.log('[SET] Object:', this.animeInfo);
    return this.apiCall('POST', {
      url,
      data: parameter,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }).then(data => {
      if (data.indexOf('Successfully') >= 0) {
        this.logger.log('Update Succeeded');
      } else {
        throw this.errorObj(errorCode.ServerOffline, 'Update failed');
      }
    });
  }

  protected apiCall(post, options) {
    return api.request.xhr(post, options).then(response => {
      if ((response.status > 499 && response.status < 600) || response.status === 0) {
        throw this.errorObj(errorCode.ServerOffline, `Server Offline status: ${response.status}`);
      }
      if (
        response.finalUrl.indexOf('myanimelist.net/login.php') > -1 ||
        response.responseText.indexOf('Unauthorized') > -1
      ) {
        this._authenticated = false;
        throw this.errorObj(errorCode.NotAutenticated, 'Not Authenticated');
      }

      return response.responseText;
    });
  }

  private getObject(data) {
    const { getselect } = utils;
    if (
      typeof data.split('<form name="')[1] === 'undefined' &&
      (this.url.indexOf('/manga/') !== -1 || this.url.indexOf('/anime/') !== -1)
    ) {
      if (data.indexOf('you are not a bot') > -1) {
        throw this.errorObj(errorCode.GenericError, `Access restricted. Please open myanimelist.net`);
      }
      throw this.errorObj(errorCode.ServerOffline, 'MAL is down or otherwise giving bad data');
    }

    this._onList = true;
    this.pending = false;

    const anime: any = {};

    if (this.type === 'anime') {
      anime['.csrf_token'] = data
        .split("'csrf_token'")[1]
        .split("'")[1]
        .split("'")[0];
      if (data.indexOf('Add Anime') > -1) {
        this._onList = false;
      }
      if (data.indexOf('pending approval') > -1) {
        this.pending = true;
      }
      data = data.split('<form name="')[1].split('</form>')[0];

      this.additionalInfo.totalEp = parseInt(data.split('id="totalEpisodes">')[1].split('<')[0]);
      this.additionalInfo.name = data
        .split('<a href="')[1]
        .split('">')[1]
        .split('<')[0]
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'");
      anime['.anime_id'] = parseInt(
        data
          .split('name="anime_id"')[1]
          .split('value="')[1]
          .split('"')[0],
      ); // input
      anime['.aeps'] = parseInt(
        data
          .split('name="aeps"')[1]
          .split('value="')[1]
          .split('"')[0],
      );
      anime['.astatus'] = parseInt(
        data
          .split('name="astatus"')[1]
          .split('value="')[1]
          .split('"')[0],
      );
      anime['.add_anime[status]'] = parseInt(getselect(data, 'add_anime[status]'));
      if (!anime['.add_anime[status]']) anime['.add_anime[status]'] = 6;
      // Rewatching
      if (
        data
          .split('name="add_anime[is_rewatching]"')[1]
          .split('>')[0]
          .indexOf('checked="checked"') >= 0
      ) {
        anime['.add_anime[is_rewatching]'] = 1;
      }
      //
      anime['.add_anime[num_watched_episodes]'] = parseInt(
        data
          .split('name="add_anime[num_watched_episodes]"')[1]
          .split('value="')[1]
          .split('"')[0],
      );
      if (Number.isNaN(anime['.add_anime[num_watched_episodes]'])) {
        anime['.add_anime[num_watched_episodes]'] = '';
      }
      anime['.add_anime[score]'] = getselect(data, 'add_anime[score]');
      anime['.add_anime[start_date][month]'] = getselect(data, 'add_anime[start_date][month]');
      anime['.add_anime[start_date][day]'] = getselect(data, 'add_anime[start_date][day]');
      anime['.add_anime[start_date][year]'] = getselect(data, 'add_anime[start_date][year]');
      anime['.add_anime[finish_date][month]'] = getselect(data, 'add_anime[finish_date][month]');
      anime['.add_anime[finish_date][day]'] = getselect(data, 'add_anime[finish_date][day]');
      anime['.add_anime[finish_date][year]'] = getselect(data, 'add_anime[finish_date][year]');
      anime['.add_anime[tags]'] = utils.parseHtml(
        data
          .split('name="add_anime[tags]"')[1]
          .split('>')[1]
          .split('<')[0],
      ); // textarea
      anime['.add_anime[priority]'] = getselect(data, 'add_anime[priority]');
      anime['.add_anime[storage_type]'] = getselect(data, 'add_anime[storage_type]');
      anime['.add_anime[storage_value]'] = data
        .split('name="add_anime[storage_value]"')[1]
        .split('value="')[1]
        .split('"')[0];
      anime['.add_anime[num_watched_times]'] = data
        .split('name="add_anime[num_watched_times]"')[1]
        .split('value="')[1]
        .split('"')[0];
      anime['.add_anime[rewatch_value]'] = getselect(data, 'add_anime[rewatch_value]');
      anime['.add_anime[comments]'] = utils.parseHtml(
        data
          .split('name="add_anime[comments]"')[1]
          .split('>')[1]
          .split('<')[0],
      );
      anime['.add_anime[is_asked_to_discuss]'] = getselect(data, 'add_anime[is_asked_to_discuss]');
      if (anime['.add_anime[is_asked_to_discuss]'] === '') anime['.add_anime[is_asked_to_discuss]'] = 0; // #15
      anime['.add_anime[sns_post_type]'] = getselect(data, 'add_anime[sns_post_type]');
    } else {
      anime['.csrf_token'] = data
        .split("'csrf_token'")[1]
        .split("'")[1]
        .split("'")[0];
      if (data.indexOf('Add Manga') > -1) {
        this._onList = false;
      }
      if (data.indexOf('pending approval') > -1) {
        this.pending = true;
      }
      data = data.split('<form name="')[1].split('</form>')[0];

      this.additionalInfo.totalEp = parseInt(data.split('id="totalChap">')[1].split('<')[0]);
      this.additionalInfo.totalVol = parseInt(data.split('id="totalVol">')[1].split('<')[0]);
      this.additionalInfo.name = data
        .split('<a href="')[1]
        .split('">')[1]
        .split('<')[0]
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'");
      anime['.entry_id'] = parseInt(
        data
          .split('name="entry_id"')[1]
          .split('value="')[1]
          .split('"')[0],
      );
      anime['.manga_id'] = parseInt(
        data
          .split('name="manga_id"')[1]
          .split('value="')[1]
          .split('"')[0],
      ); // input
      anime.volumes = parseInt(
        data
          .split('id="volumes"')[1]
          .split('value="')[1]
          .split('"')[0],
      );
      anime.mstatus = parseInt(
        data
          .split('id="mstatus"')[1]
          .split('value="')[1]
          .split('"')[0],
      );
      anime['.add_manga[status]'] = parseInt(getselect(data, 'add_manga[status]'));
      if (!anime['.add_manga[status]']) anime['.add_manga[status]'] = 6;
      // Rewatching
      if (
        data
          .split('name="add_manga[is_rereading]"')[1]
          .split('>')[0]
          .indexOf('checked="checked"') >= 0
      ) {
        anime['.add_manga[is_rereading]'] = 1;
      }
      //
      anime['.add_manga[num_read_volumes]'] = parseInt(
        data
          .split('name="add_manga[num_read_volumes]"')[1]
          .split('value="')[1]
          .split('"')[0],
      );
      if (Number.isNaN(anime['.add_manga[num_read_volumes]'])) {
        anime['.add_manga[num_read_volumes]'] = '';
      }
      anime['.add_manga[num_read_chapters]'] = parseInt(
        data
          .split('name="add_manga[num_read_chapters]"')[1]
          .split('value="')[1]
          .split('"')[0],
      );
      if (Number.isNaN(anime['.add_manga[num_read_chapters]'])) {
        anime['.add_manga[num_read_chapters]'] = '';
      }
      anime['.add_manga[score]'] = getselect(data, 'add_manga[score]');
      anime['.add_manga[start_date][month]'] = getselect(data, 'add_manga[start_date][month]');
      anime['.add_manga[start_date][day]'] = getselect(data, 'add_manga[start_date][day]');
      anime['.add_manga[start_date][year]'] = getselect(data, 'add_manga[start_date][year]');
      anime['.add_manga[finish_date][month]'] = getselect(data, 'add_manga[finish_date][month]');
      anime['.add_manga[finish_date][day]'] = getselect(data, 'add_manga[finish_date][day]');
      anime['.add_manga[finish_date][year]'] = getselect(data, 'add_manga[finish_date][year]');
      anime['.add_manga[tags]'] = utils.parseHtml(
        data
          .split('name="add_manga[tags]"')[1]
          .split('>')[1]
          .split('<')[0],
      ); // textarea
      anime['.add_manga[priority]'] = getselect(data, 'add_manga[priority]');
      anime['.add_manga[storage_type]'] = getselect(data, 'add_manga[storage_type]');
      anime['.add_manga[num_retail_volumes]'] = data
        .split('name="add_manga[num_retail_volumes]"')[1]
        .split('value="')[1]
        .split('"')[0];
      anime['.add_manga[num_read_times]'] = data
        .split('name="add_manga[num_read_times]"')[1]
        .split('value="')[1]
        .split('"')[0];
      anime['.add_manga[reread_value]'] = getselect(data, 'add_manga[reread_value]');
      anime['.add_manga[comments]'] = utils.parseHtml(
        data
          .split('name="add_manga[comments]"')[1]
          .split('>')[1]
          .split('<')[0],
      );
      anime['.add_manga[is_asked_to_discuss]'] = getselect(data, 'add_manga[is_asked_to_discuss]');
      if (anime['.add_manga[is_asked_to_discuss]'] === '') anime['.add_manga[is_asked_to_discuss]'] = 0; // #15
      anime['.add_manga[sns_post_type]'] = getselect(data, 'add_manga[sns_post_type]');
    }

    anime['.submitIt'] = data
      .split('name="submitIt"')[1]
      .split('value="')[1]
      .split('"')[0];
    this.logger.log('[GET] Object:', anime);
    return anime;
  }

  setCompletionDateToNow() {
    const Datec = new Date();
    if (
      this.animeInfo['.add_anime[finish_date][day]'] === '' ||
      this.animeInfo['.add_manga[finish_date][day]'] === ''
    ) {
      if (this.type === 'manga') {
        this.animeInfo['.add_manga[finish_date][year]'] = Datec.getFullYear();
        this.animeInfo['.add_manga[finish_date][month]'] = Datec.getMonth() + 1;
        this.animeInfo['.add_manga[finish_date][day]'] = Datec.getDate();
      }
      this.animeInfo['.add_anime[finish_date][year]'] = Datec.getFullYear();
      this.animeInfo['.add_anime[finish_date][month]'] = Datec.getMonth() + 1;
      this.animeInfo['.add_anime[finish_date][day]'] = Datec.getDate();
    } else {
      this.logger.error('Completion date already set');
    }
  }

  setStartingDateToNow() {
    const Datec = new Date();
    if (this.animeInfo['.add_anime[start_date][day]'] === '' || this.animeInfo['.add_manga[start_date][day]'] === '') {
      if (this.type === 'manga') {
        this.animeInfo['.add_manga[start_date][year]'] = Datec.getFullYear();
        this.animeInfo['.add_manga[start_date][month]'] = Datec.getMonth() + 1;
        this.animeInfo['.add_manga[start_date][day]'] = Datec.getDate();
      }
      this.animeInfo['.add_anime[start_date][year]'] = Datec.getFullYear();
      this.animeInfo['.add_anime[start_date][month]'] = Datec.getMonth() + 1;
      this.animeInfo['.add_anime[start_date][day]'] = Datec.getDate();
    } else {
      this.logger.info('Start date already set');
    }
  }

  delete() {
    const url = `https://myanimelist.net/ownlist/${this.type}/${this.ids.mal}/delete`;
    return this.apiCall('POST', {
      url,
      data: `csrf_token=${this.animeInfo['.csrf_token']}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  }

  public async fillRelations(): Promise<void> {
    const cacheObj = new Cache(`fillRelations/${this.ids.mal}/${this.getType()}`, 7 * 24 * 60 * 60 * 1000);

    return cacheObj.hasValueAndIsNotEmpty().then(exists => {
      if (!exists) {
        return malToAnilist(this.ids.mal, this.getType()!).then(el => {
          if (el && parseInt(el)) {
            this.ids.ani = parseInt(el);
          }
          return cacheObj.setValue({ da: el });
        });
      }
      return cacheObj.getValue().then(res => {
        if (res && res.da && parseInt(res.da)) {
          this.ids.ani = parseInt(res.da);
        }
      });
    });
  }
}
*/
