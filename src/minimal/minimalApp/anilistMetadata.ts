export class metadata{
  private xhr;

  id: number;
  private aniId: number = NaN;
  readonly type: "anime"|"manga";

  constructor(public malUrl:string){
    this.type = utils.urlPart(malUrl, 3);
    if(typeof malUrl !== 'undefined' && malUrl.indexOf("myanimelist.net") > -1){
      this.id = utils.urlPart(malUrl, 4);
    }else if(typeof malUrl !== 'undefined' && malUrl.indexOf("anilist.co") > -1){
      this.id = NaN;
      this.aniId = utils.urlPart(malUrl, 4);
    }else{
      this.id = NaN;
    }
  }

  init(){
    con.log('Update AniList info', this.id? 'MAL: '+this.id : 'AniList: '+this.aniId);
    var selectId = this.id;
    var selectQuery = 'idMal';
    if(isNaN(this.id)){
      selectId = this.aniId;
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
        synonyms
        description(asHtml: true)
        coverImage{
          large
        }
        title {
          userPreferred
          romaji
          english
          native
        }
        characters (perPage: 6, sort: [ROLE, ID]) {
            edges {
                id
                role
                node {
                    id
                    siteUrl
                    name {
                        first
                        last
                    }
                    image {
                        large
                    }
                }
            }
        }
      }
    }
    `;
    ​
    var variables = {
      id: selectId,
      type: this.type.toUpperCase()
    };

    return api.request.xhr('POST', {
      url: 'https://graphql.anilist.co',
      headers: {
        //'Authorization': 'Bearer ' + helper.accessToken(),
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      data: JSON.stringify({
        query: query,
        variables: variables
      })
    }).then((response) => {
      var res = JSON.parse(response.responseText);
      con.log(res);
      this.xhr = res;
      return this
    });
  };

  getTitle(){
    var title = '';
    try{
      title = this.xhr.data.Media.title.userPreferred
    }catch(e) {console.log('[iframeOverview] Error:',e);}
    return title;
  }

  getDescription(){
    var description = '';
    try{
      description = this.xhr.data.Media.description;
    }catch(e) {console.log('[iframeOverview] Error:',e);}
    return description;
  }

  getImage(){
    var image = '';
    try{
      image = this.xhr.data.Media.coverImage.large;
    }catch(e) {console.log('[iframeOverview] Error:',e);}
    return image;
  }

  getAltTitle(){
    var altTitle: string[] = [];
    try{
      for (var prop in this.xhr.data.Media.title) {
        var el = this.xhr.data.Media.title[prop];
        if(el !== this.getTitle()){
          altTitle.push(el);
        }
      }
    }catch(e) {console.log('[iframeOverview] Error:',e);}
    return altTitle;
  }

  getCharacters(){
    var charArray:any[] = [];
    try{
      this.xhr.data.Media.characters.edges.forEach(function(i){
        con.error(i);
        var name = ''
        if(i.node.name.last !== null) name += i.node.name.last;
        if(i.node.name.first !== "" && i.node.name.last !== "" && i.node.name.first !== null && i.node.name.last !== null ){
          name += ', '
        }
        if(i.node.name.first !== null) name += i.node.name.first;
        name = '<a href="'+i.node.siteUrl+'">'+name+'</a>';
        charArray.push({
          img: i.node.image.large,
          html: name
        });
      })
    }catch(e) {console.log('[iframeOverview] Error:',e);}
    return charArray;
  }

  getStatistics(){
    var stats: any[] = [];
    try{

    }catch(e) {console.log('[iframeOverview] Error:',e);}
    return stats;
  }

  getInfo(){
    var html: any[] = [];
    try{

    }catch(e) {console.log('[iframeOverview] Error:',e);}
    return html;
  }

  getOpeningSongs(){
    var openingSongs = [];

    try{

    }catch(e) {console.log('[iframeOverview] Error:',e);}

    return openingSongs;
  }

  getEndingSongs(){
    var endingSongs = [];

    try{

    }catch(e) {console.log('[iframeOverview] Error:',e);}

    return endingSongs;
  }

  getRelated(){
    var html = '';
    var el:{type: string, links: any[]}[] = [];
    try{

    }catch(e) {console.log('[iframeOverview] Error:',e);}
    return el;
  }

}
