export class mal{

  readonly id: number;
  readonly type: "anime"|"manga";

  name: string = "";
  totalEp: number = NaN;
  totalVol?: number;
  addAnime: boolean = false;

  private animeInfo;

  constructor(public url:string){
    con.error('mal', url);
    this.id = utils.urlPart(url, 4);
    this.type = utils.urlPart(url, 3);
    this.update();
  }

  update(){
    var editUrl = 'https://myanimelist.net/ownlist/'+this.type+'/'+this.id+'/edit?hideLayout';
    con.log('Update MAL info', editUrl);
    api.request.xhr('GET', editUrl).then((response) => {
      con.info('test', response);
      this.animeInfo = this.getObject(response.responseText);
    });
  }

  getEpisode(){
    if(this.type == "manga"){
      return this.animeInfo[".add_manga[num_read_chapters]"];
    }
    return this.animeInfo[".add_anime[num_watched_episodes]"];
  }

  setEpisode(ep:number){
    if(this.type == "manga"){
      this.animeInfo[".add_manga[num_read_chapters]"] = ep;
    }
    this.animeInfo[".add_anime[num_watched_episodes]"] = ep;
  }

  getStatus(){
    if(this.type == "manga"){
      return this.animeInfo[".add_manga[status]"];
    }
    return this.animeInfo[".add_anime[status]"];
  }

  setStatus(status:number){
    if(this.type == "manga"){
      this.animeInfo[".add_manga[status]"] = status;
    }
    this.animeInfo[".add_anime[status]"] = status;
  }

  getScore(){
    if(this.type == "manga"){
      return this.animeInfo[".add_manga[score]"];
    }
    return this.animeInfo[".add_anime[score]"];
  }

  setScore(score:number){
    if(this.type == "manga"){
      this.animeInfo[".add_manga[score]"] = score;
    }
    this.animeInfo[".add_anime[score]"] = score;
  }

  sync(){
    var This = this;
    var url = "https://myanimelist.net/ownlist/"+this.type+"/"+this.id+"/edit";
    if(this.addAnime){
      if(this.type == 'anime'){
        url = "https://myanimelist.net/ownlist/anime/add?selected_series_id="+this.id;
        utils.flashConfirm('Add "'+this.name+'" to MAL?', 'add', function(){continueCall();}, function(){
            /*if(change['checkIncrease'] == 1){TODO
                episodeInfo(change['.add_anime[num_watched_episodes]'], actual['malurl']);
            }*/
        });
        return;
      }else{
        url = "https://myanimelist.net/ownlist/manga/add?selected_manga_id="+this.id;
        utils.flashConfirm('Add "'+this.name+'" to MAL?', 'add', function(){continueCall();}, function(){});
        return;
      }
    }

    continueCall();
    function continueCall(){
      var parameter = "";
      $.each( This.animeInfo, function( index, value ){
          if(index.toString().charAt(0) == "."){
              if(!( (index === '.add_anime[is_rewatching]' || index === '.add_manga[is_rereading]') && parseInt(value) === 0)){
                  parameter += encodeURIComponent (index.toString().substring(1))+"="+encodeURIComponent (value)+"&";
              }
          }
      });

      con.log('[SET] URL:', url);
      con.log('[SET] Object:', This.animeInfo);

      api.request.xhr('POST', {url: url, data: parameter, headers: {"Content-Type": "application/x-www-form-urlencoded"} }).then((response) => {
        con.info('test', response);
        if(response.responseText.indexOf('Successfully') >= 0){
          alert('Success');
        }else{
          alert('update Failed');
        }
        //This.animeInfo = This.getObject(response.responseText);
      });
    }
  }

  private getObject(data){
    var getselect = utils.getselect;
    if (typeof data.split('<form name="')[1] === "undefined" && (this.url.indexOf('/manga/') !== -1 || this.url.indexOf('/anime/') !== -1)) {
      throw new Error("MAL is down or otherwise giving bad data");
    }
    if(this.type == 'anime'){
      var anime = {};
      anime['.csrf_token'] =  data.split('\'csrf_token\'')[1].split('\'')[1].split('\'')[0];
      if(data.indexOf('Add Anime') > -1) {
        this.addAnime = true;
      }
      data = data.split('<form name="')[1].split('</form>')[0];

      this.totalEp = parseInt(data.split('id="totalEpisodes">')[1].split('<')[0]);
      this.name = data.split('<a href="')[1].split('">')[1].split('<')[0];
      anime['.anime_id'] = parseInt(data.split('name="anime_id"')[1].split('value="')[1].split('"')[0]); //input
      anime['.aeps'] = parseInt(data.split('name="aeps"')[1].split('value="')[1].split('"')[0]);
      anime['.astatus'] = parseInt(data.split('name="astatus"')[1].split('value="')[1].split('"')[0]);
      anime['.add_anime[status]'] = parseInt(getselect(data,'add_anime[status]'));
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
      anime['.add_anime[tags]'] = data.split('name="add_anime[tags]"')[1].split('>')[1].split('<')[0];//textarea
      anime['.add_anime[priority]'] = getselect(data,'add_anime[priority]');
      anime['.add_anime[storage_type]'] = getselect(data,'add_anime[storage_type]');
      anime['.add_anime[storage_value]'] = data.split('name="add_anime[storage_value]"')[1].split('value="')[1].split('"')[0];
      anime['.add_anime[num_watched_times]'] = data.split('name="add_anime[num_watched_times]"')[1].split('value="')[1].split('"')[0];
      anime['.add_anime[rewatch_value]'] = getselect(data,'add_anime[rewatch_value]');
      anime['.add_anime[comments]'] = data.split('name="add_anime[comments]"')[1].split('>')[1].split('<')[0];
      anime['.add_anime[is_asked_to_discuss]'] = getselect(data,'add_anime[is_asked_to_discuss]');
      anime['.add_anime[sns_post_type]'] = getselect(data,'add_anime[sns_post_type]');
      anime['.submitIt'] = data.split('name="submitIt"')[1].split('value="')[1].split('"')[0];
      con.log('[GET] Object:',anime);
      return anime;
    }else{
      var anime = {};
      anime['.csrf_token'] =  data.split('\'csrf_token\'')[1].split('\'')[1].split('\'')[0];
      if(data.indexOf('Add Manga') > -1) {
          this.addAnime = true;
      }
      data = data.split('<form name="')[1].split('</form>')[0];

      this.totalEp = parseInt(data.split('id="totalChap">')[1].split('<')[0]);
      this.totalVol = parseInt(data.split('id="totalVol">')[1].split('<')[0]);
      this.name = data.split('<a href="')[1].split('">')[1].split('<')[0];
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
      anime['.add_manga[tags]'] = data.split('name="add_manga[tags]"')[1].split('>')[1].split('<')[0];//textarea
      anime['.add_manga[priority]'] = getselect(data,'add_manga[priority]');
      anime['.add_manga[storage_type]'] = getselect(data,'add_manga[storage_type]');
      anime['.add_manga[num_retail_volumes]'] = data.split('name="add_manga[num_retail_volumes]"')[1].split('value="')[1].split('"')[0];
      anime['.add_manga[num_read_times]'] = data.split('name="add_manga[num_read_times]"')[1].split('value="')[1].split('"')[0];
      anime['.add_manga[reread_value]'] = getselect(data,'add_manga[reread_value]');
      anime['.add_manga[comments]'] = data.split('name="add_manga[comments]"')[1].split('>')[1].split('<')[0];
      anime['.add_manga[is_asked_to_discuss]'] = getselect(data,'add_manga[is_asked_to_discuss]');
      anime['.add_manga[sns_post_type]'] = getselect(data,'add_manga[sns_post_type]');
      anime['.submitIt'] = data.split('name="submitIt"')[1].split('value="')[1].split('"')[0];
      con.log('[GET] Object:', anime);
      return anime;
    }
  }
}
