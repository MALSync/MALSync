import {SingleAbstract} from './../singleAbstract';
import {errorCode} from "./../definitions";

export class Single extends SingleAbstract {

  private animeInfo: any;

  private displayUrl: string = '';

  private additionalInfo = {
    name: 'Unknown',
    totalEp: 0,
    totalVol: 0
  };

  private pending: boolean = false;

  shortName = 'MAL';
  authenticationUrl = 'https://myanimelist.net/login.php';

  protected handleUrl(url) {
    if(url.match(/myanimelist\.net\/(anime|manga)\/\d*/i)) {
      this.type = utils.urlPart(url, 3);
      this.ids.mal = utils.urlPart(url, 4);
      return;
    }
    throw this.errorObj(errorCode.UrlNotSuported, 'Url not supported')
  }

  getCacheKey(){
    return this.ids.mal;
  }

  _getStatus() {
    if(this.type == "manga"){
      var curSt = this.animeInfo[".add_manga[status]"];
    }else{
      var curSt = this.animeInfo[".add_anime[status]"];
    }
    if(this.getRewatching() && curSt === 2) return 23;
    return curSt;
  }

  _setStatus(status) {
    if(status == 23) {
      status = 2;
      this.setRewatching(true);
    }else{
      this.setRewatching(false);
    }
    if(this.type == "manga"){
      this.animeInfo[".add_manga[status]"] = status;
    }
    this.animeInfo[".add_anime[status]"] = status;
  }

  _getScore() {
    if(this.type == "manga"){
      return this.animeInfo[".add_manga[score]"];
    }
    return this.animeInfo[".add_anime[score]"];
  }

  _setScore(score) {
    //@ts-ignore
    if(!score) score = "";
    if(this.type == "manga"){
      this.animeInfo[".add_manga[score]"] = score;
    }
    this.animeInfo[".add_anime[score]"] = score;
  }

  _getEpisode() {
    if(this.type == "manga"){
      return this.animeInfo[".add_manga[num_read_chapters]"];
    }
    return this.animeInfo[".add_anime[num_watched_episodes]"];
  }

  _setEpisode(episode) {
    if(!episode) episode = 0;
    if(this.type == "manga"){
      this.animeInfo[".add_manga[num_read_chapters]"] = parseInt(episode+'');
    }
    this.animeInfo[".add_anime[num_watched_episodes]"] = parseInt(episode+'');
  }

  _getVolume() {
    if(this.type == "manga"){
      return this.animeInfo[".add_manga[num_read_volumes]"];
    }
    return 0;
  }

  _setVolume(volume) {
    if(this.type == "manga"){
      this.animeInfo[".add_manga[num_read_volumes]"] = volume;
      return;
    }
  }

  _getStreamingUrl() {
    var tags = this.animeInfo[".add_anime[tags]"];
    if(this.type == "manga"){
      tags = this.animeInfo[".add_manga[tags]"];
    }
    return utils.getUrlFromTags(tags);
  }

  _setStreamingUrl(url) {
    var tags = this.animeInfo[".add_anime[tags]"];
    if(this.type == "manga"){
      tags = this.animeInfo[".add_manga[tags]"];
    }
    if(!tags) tags = '';

    tags = utils.setUrlInTags(url, tags);

    if(this.type == "manga"){
      this.animeInfo[".add_manga[tags]"] = tags;
      return;
    }
    this.animeInfo[".add_anime[tags]"] = tags;
  }

  private getRewatching(): boolean {
    if(this.type == "manga"){
      return this.animeInfo[".add_manga[is_rereading]"];
    }
    return this.animeInfo[".add_anime[is_rewatching]"];
  }

  private setRewatching(state: boolean) {
    var sState = 0;
    if(state) sState = 1;
    if(this.type == "manga"){
      this.animeInfo[".add_manga[is_rereading]"] = sState;
      return;
    }
    this.animeInfo[".add_anime[is_rewatching]"] = sState;
  }

  _getTitle() {
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
    return this.apiCall('GET', this.url).then((data) => {
      var image = '';
      try{
          image = data.split('property="og:image"')[1].split('content="')[1].split('"')[0];
      }catch(e) {console.log('[mal.ts] Error:',e);}
      return image;
    });
  }

  _getRating() {
    var url = '';
    if(this.type == 'anime'){
      url = 'https://myanimelist.net/includes/ajax.inc.php?t=64&id='+this.ids.mal;
    }else{
      url = 'https://myanimelist.net/includes/ajax.inc.php?t=65&id='+this.ids.mal;
    }

    return this.apiCall('GET', url).then((data) => {
      return data.split('Score:</span>')[1].split('<')[0];
    });
  }

  _update() {
    var editUrl = 'https://myanimelist.net/ownlist/'+this.type+'/'+this.ids.mal+'/edit?hideLayout';
    con.log('Update MAL info', editUrl);
    return this.apiCall('GET', editUrl).then((data) => {
      this._authenticated = true;
      this.animeInfo = this.getObject(data);
    });
  }

  _sync() {
    var url = "https://myanimelist.net/ownlist/"+this.type+"/"+this.ids.mal+"/edit";
    if(this.pending){
      //TODO
      utils.flashm('This '+this.type+' is currently pending approval. It can´t be saved to mal for now')
      return;
    }

    if(!this._onList) {
      if(this.type == 'anime'){
        url = "https://myanimelist.net/ownlist/anime/add?selected_series_id="+this.ids.mal;
      }else{
        url = "https://myanimelist.net/ownlist/manga/add?selected_manga_id="+this.ids.mal;
      }
    }

    if(this.getStatus() == 1 && this.getEpisode() > 0) {
      this.setStartingDateToNow();
    }

    if(this.getStatus() == 2) {
      this.setCompletionDateToNow();
      if(this.getTotalEpisodes()) this.setEpisode(this.getTotalEpisodes());
    }

    var parameter = "";
    j.$.each( this.animeInfo, function( index, value ){
      if(index.toString().charAt(0) === "."){
        if(!( (index === '.add_anime[is_rewatching]' || index === '.add_manga[is_rereading]') && parseInt(value) === 0)){
          parameter += encodeURIComponent (index.toString().substring(1))+"="+encodeURIComponent (value)+"&";
        }
      }
    });
    con.log('[SET] URL:', url);
    con.log('[SET] Object:', this.animeInfo);
    return this.apiCall('POST', {url: url, data: parameter, headers: {"Content-Type": "application/x-www-form-urlencoded"} }).then((data) => {
      if(data.indexOf('Successfully') >= 0){
        con.log('Update Succeeded');
      }else{
        //TODO
        throw 'Update failed';
      }

    });
  }

  protected apiCall(post, options) {
    return api.request.xhr(post, options)
      .then((response) => {
        if((response.status > 499 && response.status < 600) || response.status === 0) {
          throw this.errorObj(errorCode.ServerOffline, 'Server Offline status: '+response.status)
        }
        if(response.finalUrl.indexOf("myanimelist.net/login.php") > -1 || response.responseText.indexOf("Unauthorized") > -1) {
          this._authenticated = false;
          throw this.errorObj(errorCode.NotAutenticated, 'Not Authenticated');
        }

        return response.responseText;
      });
  }

  private getObject(data){
    var getselect = utils.getselect;
    if (typeof data.split('<form name="')[1] === "undefined" && (this.url.indexOf('/manga/') !== -1 || this.url.indexOf('/anime/') !== -1)) {
      //TODO
      throw new Error("MAL is down or otherwise giving bad data");
    }

    this._onList = true;
    this.pending = false;

    if(this.type === 'anime'){
      var anime = {};
      anime['.csrf_token'] =  data.split('\'csrf_token\'')[1].split('\'')[1].split('\'')[0];
      if(data.indexOf('Add Anime') > -1) {
        this._onList = false;
      }
      if(data.indexOf('pending approval') > -1){
        this.pending = true;
      }
      data = data.split('<form name="')[1].split('</form>')[0];

      this.additionalInfo.totalEp = parseInt(data.split('id="totalEpisodes">')[1].split('<')[0]);
      this.additionalInfo.name = data.split('<a href="')[1].split('">')[1].split('<')[0];
      anime['.anime_id'] = parseInt(data.split('name="anime_id"')[1].split('value="')[1].split('"')[0]); //input
      anime['.aeps'] = parseInt(data.split('name="aeps"')[1].split('value="')[1].split('"')[0]);
      anime['.astatus'] = parseInt(data.split('name="astatus"')[1].split('value="')[1].split('"')[0]);
      anime['.add_anime[status]'] = parseInt(getselect(data,'add_anime[status]'));
      if(!anime['.add_anime[status]']) anime['.add_anime[status]'] = 6;
      //Rewatching
      if(data.split('name="add_anime[is_rewatching]"')[1].split('>')[0].indexOf('checked="checked"') >= 0){
          anime['.add_anime[is_rewatching]'] = 1;
      }
      //
      anime['.add_anime[num_watched_episodes]'] = parseInt(data.split('name="add_anime[num_watched_episodes]"')[1].split('value="')[1].split('"')[0]);
      if( isNaN(anime['.add_anime[num_watched_episodes]']) ){ anime['.add_anime[num_watched_episodes]'] = ''; }
      anime['.add_anime[score]'] = getselect(data,'add_anime[score]');
      anime['.add_anime[start_date][month]'] = getselect(data,'add_anime[start_date][month]');
      anime['.add_anime[start_date][day]'] = getselect(data,'add_anime[start_date][day]');
      anime['.add_anime[start_date][year]'] = getselect(data,'add_anime[start_date][year]');
      anime['.add_anime[finish_date][month]'] = getselect(data,'add_anime[finish_date][month]');
      anime['.add_anime[finish_date][day]'] = getselect(data,'add_anime[finish_date][day]');
      anime['.add_anime[finish_date][year]'] = getselect(data,'add_anime[finish_date][year]');
      anime['.add_anime[tags]'] = utils.parseHtml(data.split('name="add_anime[tags]"')[1].split('>')[1].split('<')[0]);//textarea
      anime['.add_anime[priority]'] = getselect(data,'add_anime[priority]');
      anime['.add_anime[storage_type]'] = getselect(data,'add_anime[storage_type]');
      anime['.add_anime[storage_value]'] = data.split('name="add_anime[storage_value]"')[1].split('value="')[1].split('"')[0];
      anime['.add_anime[num_watched_times]'] = data.split('name="add_anime[num_watched_times]"')[1].split('value="')[1].split('"')[0];
      anime['.add_anime[rewatch_value]'] = getselect(data,'add_anime[rewatch_value]');
      anime['.add_anime[comments]'] = utils.parseHtml(data.split('name="add_anime[comments]"')[1].split('>')[1].split('<')[0]);
      anime['.add_anime[is_asked_to_discuss]'] = getselect(data,'add_anime[is_asked_to_discuss]');
      if(anime['.add_anime[is_asked_to_discuss]'] === '') anime['.add_anime[is_asked_to_discuss]'] = 0; //#15
      anime['.add_anime[sns_post_type]'] = getselect(data,'add_anime[sns_post_type]');
      anime['.submitIt'] = data.split('name="submitIt"')[1].split('value="')[1].split('"')[0];
      con.log('[GET] Object:',anime);
      return anime;
    }else{
      var anime = {};
      anime['.csrf_token'] =  data.split('\'csrf_token\'')[1].split('\'')[1].split('\'')[0];
      if(data.indexOf('Add Manga') > -1) {
          this._onList = false;
      }
      if(data.indexOf('pending approval') > -1){
        this.pending = true;
      }
      data = data.split('<form name="')[1].split('</form>')[0];

      this.additionalInfo.totalEp = parseInt(data.split('id="totalChap">')[1].split('<')[0]);
      this.additionalInfo.totalVol = parseInt(data.split('id="totalVol">')[1].split('<')[0]);
      this.additionalInfo.name = data.split('<a href="')[1].split('">')[1].split('<')[0];
      anime['.entry_id'] = parseInt(data.split('name="entry_id"')[1].split('value="')[1].split('"')[0]);
      anime['.manga_id'] = parseInt(data.split('name="manga_id"')[1].split('value="')[1].split('"')[0]); //input
      anime['volumes'] = parseInt(data.split('id="volumes"')[1].split('value="')[1].split('"')[0]);
      anime['mstatus'] = parseInt(data.split('id="mstatus"')[1].split('value="')[1].split('"')[0]);
      anime['.add_manga[status]'] = parseInt(getselect(data,'add_manga[status]'));
      //Rewatching
      if(data.split('name="add_manga[is_rereading]"')[1].split('>')[0].indexOf('checked="checked"') >= 0){
          anime['.add_manga[is_rereading]'] = 1;
      }
      //
      anime['.add_manga[num_read_volumes]'] = parseInt(data.split('name="add_manga[num_read_volumes]"')[1].split('value="')[1].split('"')[0]);
      if( isNaN(anime['.add_manga[num_read_volumes]']) ){ anime['.add_manga[num_read_volumes]'] = ''; }
      anime['.add_manga[num_read_chapters]'] = parseInt(data.split('name="add_manga[num_read_chapters]"')[1].split('value="')[1].split('"')[0]);
      if( isNaN(anime['.add_manga[num_read_chapters]']) ){ anime['.add_manga[num_read_chapters]'] = ''; }
      anime['.add_manga[score]'] = getselect(data,'add_manga[score]');
      anime['.add_manga[start_date][month]'] = getselect(data,'add_manga[start_date][month]');
      anime['.add_manga[start_date][day]'] = getselect(data,'add_manga[start_date][day]');
      anime['.add_manga[start_date][year]'] = getselect(data,'add_manga[start_date][year]');
      anime['.add_manga[finish_date][month]'] = getselect(data,'add_manga[finish_date][month]');
      anime['.add_manga[finish_date][day]'] = getselect(data,'add_manga[finish_date][day]');
      anime['.add_manga[finish_date][year]'] = getselect(data,'add_manga[finish_date][year]');
      anime['.add_manga[tags]'] = utils.parseHtml(data.split('name="add_manga[tags]"')[1].split('>')[1].split('<')[0]);//textarea
      anime['.add_manga[priority]'] = getselect(data,'add_manga[priority]');
      anime['.add_manga[storage_type]'] = getselect(data,'add_manga[storage_type]');
      anime['.add_manga[num_retail_volumes]'] = data.split('name="add_manga[num_retail_volumes]"')[1].split('value="')[1].split('"')[0];
      anime['.add_manga[num_read_times]'] = data.split('name="add_manga[num_read_times]"')[1].split('value="')[1].split('"')[0];
      anime['.add_manga[reread_value]'] = getselect(data,'add_manga[reread_value]');
      anime['.add_manga[comments]'] = utils.parseHtml(data.split('name="add_manga[comments]"')[1].split('>')[1].split('<')[0]);
      anime['.add_manga[is_asked_to_discuss]'] = getselect(data,'add_manga[is_asked_to_discuss]');
      if(anime['.add_manga[is_asked_to_discuss]'] == '') anime['.add_manga[is_asked_to_discuss]'] = 0; //#15
      anime['.add_manga[sns_post_type]'] = getselect(data,'add_manga[sns_post_type]');
      anime['.submitIt'] = data.split('name="submitIt"')[1].split('value="')[1].split('"')[0];
      con.log('[GET] Object:', anime);
      return anime;
    }
  }

  setCompletionDateToNow(){
    var Datec = new Date();
    if(this.animeInfo['.add_anime[finish_date][day]'] === '' || this.animeInfo['.add_manga[finish_date][day]'] === ''){
      if(this.type == "manga"){
        this.animeInfo['.add_manga[finish_date][year]'] = Datec.getFullYear();
        this.animeInfo['.add_manga[finish_date][month]'] = Datec.getMonth()+1;
        this.animeInfo['.add_manga[finish_date][day]'] = Datec.getDate();
      }
      this.animeInfo['.add_anime[finish_date][year]'] = Datec.getFullYear();
      this.animeInfo['.add_anime[finish_date][month]'] = Datec.getMonth()+1;
      this.animeInfo['.add_anime[finish_date][day]'] = Datec.getDate();
    }else{
      con.error('Completion date already set');
    }
  }

  setStartingDateToNow(){
    var Datec = new Date();
    if(this.animeInfo['.add_anime[start_date][day]'] === '' || this.animeInfo['.add_manga[start_date][day]'] === ''){
      if(this.type == "manga"){
        this.animeInfo['.add_manga[start_date][year]'] = Datec.getFullYear();
        this.animeInfo['.add_manga[start_date][month]'] = Datec.getMonth()+1;
        this.animeInfo['.add_manga[start_date][day]'] = Datec.getDate();
      }
      this.animeInfo['.add_anime[start_date][year]'] = Datec.getFullYear();
      this.animeInfo['.add_anime[start_date][month]'] = Datec.getMonth()+1;
      this.animeInfo['.add_anime[start_date][day]'] = Datec.getDate();
    }else{
      con.info('Start date already set');
    }
  }
}
