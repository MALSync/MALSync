export async function scheduleUpdate(){
  await malSchedule();
  await anilistScheduler();
}

export async function malSchedule(){
  var url = 'https://myanimelist.net/anime/season/schedule';
  return api.request.xhr('GET', url).then(async (response) => {
    console.groupCollapsed('MyAnimeList Scheduler');
    con.log('Recived');
    var found = 0;
    var parsed = $.parseHTML(response.responseText);
    var se = '.js-seasonal-anime-list-key-';
    se = se+'monday, '+se+'tuesday ,'+se+'wednesday ,'+se+'thursday ,'+se+'friday ,'+se+'saturday ,'+se+'sunday';
    var seasons = $(parsed).find(se).find('.seasonal-anime');
    if(seasons.length) await clearScheduleCache();
    seasons.each(function(){
      if($(this).find('.info .remain-time').text().match(/\w+\ \d+.\ \d+,\ \d+:\d+\ \(JST\)/i)){
        var malId = $(this).find('a.link-title').attr('href')!.split('/')[4];
        var jpdate = $(this).find('.info .remain-time').text().trim();
        //day
        var day = jpdate.split(' ')[1].replace(',','').trim();
        //month
        var month = jpdate.split(' ')[0].trim();
        //@ts-ignore
        month = ("JanFebMarAprMayJunJulAugSepOctNovDec".indexOf(month) / 3 + 1);
        //year
        var year = jpdate.split(' ')[2].replace(',','').trim();
        //time
        var time = jpdate.split(' ')[3].trim();
        var minute = time.split(':')[1];
        var hour = time.split(':')[0];
        //timezone
        var timestamp = toTimestamp(year,month,day,hour,minute,0);
        con.log(malId, timestamp);
        api.storage.set('mal/'+malId+'/release', timestamp);
        var episode = $(this).find('.eps a span').last().text();
        if(episode.match(/^\d+/)){
          api.storage.set('mal/'+malId+'/eps', parseInt( episode.match(/^\d+/)![0]) );
        }
      }
      found++;
    });
    con.log('Schedule updated ('+found+')');
    console.groupEnd();
  });

  function toTimestamp(year,month,day,hour,minute,second){
    var datum = new Date(Date.UTC(year,month-1,day,hour,minute,second));
    return (datum.getTime())-32400000;//for GMT
  }

  async function clearScheduleCache(){
    var cacheArray = await api.storage.list();
    var deleted = 0;

    $.each( cacheArray, function( index, cache){
      //@ts-ignore
      if(/^mal\/[^/]+\/(release|eps|aniSch)$/.test(index)){
        api.storage.remove(String(index));
        deleted++;
      }
    });

    con.log("Cache Cleared ["+deleted+"]");
  }
}

export async function anilistScheduler(page = 0){
  `
  media (type: "ANIME", status: "RELEASING", isAdult: false) {
    id
    idMal
    nextAiringEpisode{
      episode
      airingAt
    }
  }

  `
  var query = `
    query($page: Int){
      Page(page: $page, perPage: 50){
        pageInfo{
          hasNextPage
        }
        media (type: ANIME, status: RELEASING) {
          id
          idMal
          nextAiringEpisode{
            episode
            airingAt
          }
        }
      }
    }
  `;
  
  var variables = {
    page: page
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
    console.groupCollapsed('Anilist Scheduler '+page);
    var res = JSON.parse(response.responseText);
    if(typeof res.errors !== 'undefined'){
      con.log('Anilist api limit', res);
      setTimeout(function(){
        anilistScheduler(page);
      }, 1000 * 60);
      return;
    }
    if(typeof res.data.Page.media == 'undefined'){
      throw 'anilistScheduler empty';
    }
    con.log(res.data.Page.pageInfo);
    res.data.Page.media.forEach(function(el) {
      var malId = el.idMal;
      if(malId && malId !== 'null' && malId !== null && typeof malId !== 'undefined'){
        if(el.nextAiringEpisode != null && el.nextAiringEpisode.episode > 1){
          var elObj = {
            aniId: el.id,
            currentEp: el.nextAiringEpisode.episode - 1,
            nextEpTime: el.nextAiringEpisode.airingAt
          };
          con.log(elObj);
          api.storage.set('mal/'+malId+'/aniSch', elObj);
        }
      }
    });
    con.log(res);
    console.groupEnd();
    if(res.data.Page.pageInfo.hasNextPage){
      return anilistScheduler(page + 1);
    }
  });
}
