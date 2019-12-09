import {ListAbstract, listElement} from './../listAbstract';

export class userlist extends ListAbstract {

  name = 'MyAnimeList';

  authenticationUrl = 'https://myanimelist.net/login.php';

  async getUsername() {
    var url = 'https://myanimelist.net/panel.php?go=export&hideLayout';
    return api.request.xhr('GET', url).then((response) => {
      var username = false;
      try{
        username = response.responseText.split('USER_NAME = "')[1].split('"')[0];
      }catch(e){}
      con.log('[Username]', username);
      if(!username){
        throw {
          code: 400,
          message: 'Not Authenticated',
        }
      }
      return username;
    });
  }

  errorHandling(res) {
    if(typeof res.errors != 'undefined'){
      con.error(res.errors);
      throw {
        code: parseInt(res.errors[0].status),
        message: res.errors[0].title,
      }
    }
  }

  async getPart() {
    if(!this.username){
      this.username = await this.getUsername();
    }
    con.log('[UserList][MAL]', 'username: '+this.username, 'status: '+this.status, 'offset: '+this.offset);
    var url = 'https://myanimelist.net/'+this.listType+'list/'+this.username+'/load.json?offset='+this.offset+'&status='+this.status;
    return api.request.xhr('GET', url).then((response) => {
      var res = this.jsonParse(response);
      var data = this.prepareData(res);
      if(data.length > 299){
        this.offset += 300;
      }else{
        this.done = true;
      }
      return data;
    });
  }

  private prepareData(data): listElement[]{
    var newData = [] as listElement[];
    for (var i = 0; i < data.length; i++) {
      var el = data[i];
      if(this.listType === "anime"){
        newData.push(this.fn({
          uid: el['anime_id'],
          malId: el['anime_id'],
          cacheKey: el['anime_id'],
          type: this.listType,
          title: el['anime_title'],
          url: 'https://myanimelist.net'+el['anime_url'],
          watchedEp: el['num_watched_episodes'],
          totalEp: el['anime_num_episodes'],
          status: el['status'],
          score: el['score'],
          image: el['anime_image_path'],
          tags: el['tags'],
          airingState: el['anime_airing_status'],
        }))
      }else{
        newData.push(this.fn({
          uid: el['manga_id'],
          malId: el['manga_id'],
          cacheKey: el['manga_id'],
          type: this.listType,
          title: el['manga_title'],
          url: 'https://myanimelist.net'+el['manga_url'],
          watchedEp: el['num_read_chapters'],
          totalEp: el['manga_num_chapters'],
          status: el['status'],
          score: el['score'],
          image:  el['manga_image_path'],
          tags: el['tags'],
          airingState: el['anime_airing_status'],
        }))
      }

    }
    return newData;
  }

}
