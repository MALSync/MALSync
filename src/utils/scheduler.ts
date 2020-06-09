export async function scheduleUpdate() {
  await malSchedule();
  await anilistScheduler();
}

export async function malSchedule() {
  const url = 'https://myanimelist.net/anime/season/schedule';
  return api.request.xhr('GET', url).then(async response => {
    console.groupCollapsed('MyAnimeList Scheduler');
    con.log('Recived');
    let found = 0;
    const parsed = $.parseHTML(response.responseText);
    let se = '.js-seasonal-anime-list-key-';
    se = `${se}monday, ${se}tuesday ,${se}wednesday ,${se}thursday ,${se}friday ,${se}saturday ,${se}sunday`;
    const seasons = $(parsed)
      .find(se)
      .find('.seasonal-anime');
    if (seasons.length) await clearScheduleCache();
    seasons.each(function() {
      if (
        $(this)
          .find('.info .remain-time')
          .text()
          .match(/\w+ \d+. \d+, \d+:\d+ \(JST\)/i)
      ) {
        const malId = $(this)
          .find('a.link-title')
          .attr('href')!
          .split('/')[4];
        const jpdate = $(this)
          .find('.info .remain-time')
          .text()
          .trim();
        // day
        const day = jpdate
          .split(' ')[1]
          .replace(',', '')
          .trim();
        // month
        let month = jpdate.split(' ')[0].trim();
        // @ts-ignore
        month = 'JanFebMarAprMayJunJulAugSepOctNovDec'.indexOf(month) / 3 + 1;
        // year
        const year = jpdate
          .split(' ')[2]
          .replace(',', '')
          .trim();
        // time
        const time = jpdate.split(' ')[3].trim();
        const minute = time.split(':')[1];
        const hour = time.split(':')[0];
        // timezone
        const timestamp = toTimestamp(year, month, day, hour, minute, 0);
        con.log(malId, timestamp);
        api.storage.set(`mal/${malId}/release`, timestamp);
        const episode = $(this)
          .find('.eps a span')
          .last()
          .text();
        if (episode.match(/^\d+/)) {
          api.storage.set(`mal/${malId}/eps`, parseInt(episode.match(/^\d+/)![0]));
        }
      }
      found++;
    });
    con.log(`Schedule updated (${found})`);
    console.groupEnd();
  });

  function toTimestamp(year, month, day, hour, minute, second) {
    const datum = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
    return datum.getTime() - 32400000; // for GMT
  }

  async function clearScheduleCache() {
    const cacheArray = await api.storage.list();
    let deleted = 0;

    $.each(cacheArray, function(index, cache) {
      // @ts-ignore
      if (/^mal\/[^/]+\/(release|eps|aniSch)$/.test(index)) {
        api.storage.remove(String(index));
        deleted++;
      }
    });

    con.log(`Cache Cleared [${deleted}]`);
  }
}

export async function anilistScheduler(page = 0) {
  const query = `
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

  const variables = {
    page,
  };

  return api.request
    .xhr('POST', {
      url: 'https://graphql.anilist.co',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      data: JSON.stringify({
        query,
        variables,
      }),
    })
    .then(response => {
      console.groupCollapsed(`Anilist Scheduler ${page}`);
      const res = JSON.parse(response.responseText);
      if (typeof res.errors !== 'undefined') {
        con.log('Anilist api limit', res);
        setTimeout(function() {
          anilistScheduler(page);
        }, 1000 * 60);
        return;
      }
      if (typeof res.data.Page.media === 'undefined') {
        throw 'anilistScheduler empty';
      }
      con.log(res.data.Page.pageInfo);
      res.data.Page.media.forEach(function(el) {
        const malId = el.idMal;
        if (malId && malId !== 'null' && malId !== null && typeof malId !== 'undefined') {
          if (el.nextAiringEpisode !== null && el.nextAiringEpisode.episode > 1) {
            const elObj = {
              aniId: el.id,
              currentEp: el.nextAiringEpisode.episode - 1,
              nextEpTime: el.nextAiringEpisode.airingAt,
            };
            con.log(elObj);
            api.storage.set(`mal/${malId}/aniSch`, elObj);
          }
        }
      });
      con.log(res);
      console.groupEnd();
      if (res.data.Page.pageInfo.hasNextPage) {
        /* eslint-disable-next-line consistent-return */
        return anilistScheduler(page + 1);
      }
    });
}
