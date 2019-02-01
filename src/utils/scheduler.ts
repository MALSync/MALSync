export async function scheduleUpdate(){
  var url = 'https://myanimelist.net/anime/season/schedule';
  return api.request.xhr('GET', url).then(async (response) => {
    console.groupCollapsed('Schedule');
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
      if(/^mal\/[^/]+\/(release|eps)$/.test(index)){
        api.storage.remove(index);
        deleted++;
      }
    });

    con.log("Cache Cleared ["+deleted+"]");
  }
}
