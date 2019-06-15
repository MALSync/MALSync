import {metadataInterface, searchInterface} from "./../listInterface";

export class metadata implements metadataInterface{
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
        popularity
        favourites
        rankings {
          id
          rank
          type
          format
          year
          season
          allTime
          context
        }
        relations {
            edges {
                id
                relationType (version: 2)
                node {
                    id
                    siteUrl
                    title {
                        userPreferred
                    }
                }
            }
        }
        format
        episodes
        duration
        status
        startDate {
          year
          month
          day
        }
        endDate {
          year
          month
          day
        }
        season
        studios {
            edges {
                isMain
                node {
                    siteUrl
                    id
                    name
                }
            }
        }
        source(version: 2)
        genres
        externalLinks {
          site
          url
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
        if(el !== this.getTitle() && el){
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
      if(this.xhr.data.Media.averageScore !== null) stats.push({
        title: 'Score:',
        body: this.xhr.data.Media.averageScore
      });

      if(this.xhr.data.Media.favourites !== null) stats.push({
        title: 'Favourites:',
        body: this.xhr.data.Media.favourites
      });

      if(this.xhr.data.Media.popularity !== null) stats.push({
        title: 'Popularity:',
        body: this.xhr.data.Media.popularity
      });

      this.xhr.data.Media.rankings.forEach(function(i){
        if(stats.length < 4 && i.allTime){
          var title = i.context.replace('all time', '').trim()+':';
          title = title.charAt(0).toUpperCase() + title.slice(1)

          stats.push({
            title,
            body: i.rank
          });
        }
      });
    }catch(e) {console.log('[iframeOverview] Error:',e);}
    return stats;
  }

  getInfo(){
    var html: any[] = [];
    try{
      if(this.xhr.data.Media.format !== null){
        var format = this.xhr.data.Media.format.toLowerCase().replace('_', ' ');
        format = format.charAt(0).toUpperCase() + format.slice(1)
        html.push({
          title: 'Format:',
          body: format
        });
      }

      if(this.xhr.data.Media.episodes !== null) html.push({
        title: 'Episodes:',
        body: this.xhr.data.Media.episodes
      });

      if(this.xhr.data.Media.duration !== null) html.push({
        title: 'Episode Duration:',
        body: this.xhr.data.Media.duration+' mins'
      });

      if(this.xhr.data.Media.status !== null){
        var status = this.xhr.data.Media.status.toLowerCase().replace('_', ' ');
        status = status.charAt(0).toUpperCase() + status.slice(1)
        html.push({
          title: 'Status:',
          body: status
        });
      }

      if(this.xhr.data.Media.startDate.year !== null) html.push({
        title: 'Start Date:',
        body: this.xhr.data.Media.startDate.year+'-'+this.xhr.data.Media.startDate.month+'-'+this.xhr.data.Media.startDate.day
      });

      if(this.xhr.data.Media.endDate.year !== null) html.push({
        title: 'Start Date:',
        body: this.xhr.data.Media.endDate.year+'-'+this.xhr.data.Media.endDate.month+'-'+this.xhr.data.Media.endDate.day
      });

      if(this.xhr.data.Media.season !== null){
        var season = this.xhr.data.Media.season.toLowerCase().replace('_', ' ');
        season = season.charAt(0).toUpperCase() + season.slice(1)
        if(this.xhr.data.Media.endDate.year !== null) season += ' '+this.xhr.data.Media.endDate.year
        html.push({
          title: 'Season:',
          body: season
        });
      }

      var studios = "";
      this.xhr.data.Media.studios.edges.forEach(function(i, index){
        if(i.isMain){
          if(studios !== "") studios += ', ';
          studios += '<a href="'+i.node.siteUrl+'">'+i.node.name+'</a>';
        }
      })
      if(studios !== "") html.push({
        title: 'Studios:',
        body: studios
      });

      if(this.xhr.data.Media.source !== null){
        var source = this.xhr.data.Media.source.toLowerCase().replace('_', ' ');
        source = source.charAt(0).toUpperCase() + source.slice(1)
        html.push({
          title: 'Source:',
          body: source
        });
      }

      if(this.xhr.data.Media.genres !== null) html.push({
        title: 'Genres:',
        body: this.xhr.data.Media.genres.join(', ')
      });


      var external = "";
      this.xhr.data.Media.externalLinks.forEach(function(i, index){
        if(external !== "") external += ', ';
        external += '<a href="'+i.url+'">'+i.site+'</a>';
      })
      if(external !== "") html.push({
        title: 'External Links:',
        body: external
      });

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
    var el:{type: string, links: {url: string, title: string, statusTag: string}[]}[] = [];
    var links: any = {};
    try{
      this.xhr.data.Media.relations.edges.forEach(function(i){
        if(typeof links[i.relationType] === "undefined" ){
          var title = i.relationType.toLowerCase().replace('_', ' ');
          title = title.charAt(0).toUpperCase() + title.slice(1)

          links[i.relationType] = {
            type: title,
            links: []
          };
        }
        links[i.relationType]['links'].push({
          url: i.node.siteUrl,
          title: i.node.title.userPreferred,
          statusTag: ''
        });
      });
      el = Object.keys(links).map(key => links[key]);
    }catch(e) {console.log('[iframeOverview] Error:',e);}
    return el;
  }

}

export function search(keyword, type: "anime"|"manga", options = {}, sync = false): searchInterface{
  var query = `
    query ($search: String) {
      ${type}: Page (perPage: 10) {
        pageInfo {
          total
        }
        results: media (type: ${type.toUpperCase()}, search: $search) {
          id
          siteUrl
          idMal
          title {
            userPreferred
          }
          coverImage {
            medium
          }
          type
          format
          averageScore
          startDate {
            year
          }
        }
      }
    }
  `;

  ​
  var variables = {
    search: keyword,
  };

  return api.request.xhr('POST', {
    url: 'https://graphql.anilist.co',
    headers: {
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

    var resItems:any = [];
    j.$.each(res.data[type].results, function( index, item ) {
      resItems.push({
        id: item.id,
        name: item.title.userPreferred,
        url: item.siteUrl,
        malUrl: (item.idMal) ? 'https://myanimelist.net/'+type+'/'+item.idMal : null,
        image: item.coverImage.medium,
        media_type: (item.format.charAt(0) + item.format.slice(1).toLowerCase()).replace('_', ' '),
        score: item.averageScore,
        year: item.startDate.year
      })
    });
    return resItems;
  });
};
