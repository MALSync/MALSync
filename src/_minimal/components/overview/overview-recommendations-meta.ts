import { getSyncMode } from '../../../_provider/helper';
import { apiCall, getMalDisplayTitle } from '../../../_provider/MyAnimeList_api/helper';
import { Recommendation } from '../../../_provider/metaOverviewAbstract';

export async function recommendationsMeta(malUrl: string): Promise<Recommendation[]> {
  const res: Recommendation[] = [];
  const response = await api.request.xhr('GET', `${malUrl}/_/userrecs`);

  try {
    const recommendationsBlock = response.responseText
      .split('Make a recommendation</a>')[1]
      .split('</h2>')[1]
      .split('<div class="mauto')[0];

    j.$.each(j.$(j.$.parseHTML(recommendationsBlock)).filter('.borderClass'), (index, value) => {
      const imageBlock = j.$(value).find('.picSurround');

      const titleHref = imageBlock.find('a').attr('href');

      const titleName = imageBlock.find('a > img').first().attr('alt');

      let imageUrl = imageBlock.find('a > img').first().attr('data-src');
      if (imageUrl) imageUrl = imageUrl.replace(/\/r\/\d*x\d*/g, '');

      const username = j.$(value).find('.detail-user-recs-text').next().find('a').last().text();

      const userHref = utils.absoluteLink(
        j.$(value).find('.detail-user-recs-text').next().find('a').last().attr('href'),
        'https://myanimelist.net',
      );

      const text = j
        .$(value)
        .find('.detail-user-recs-text')
        .first()
        .text()
        .replace('read more', '')
        .trim();

      const moreUrl = utils.absoluteLink(
        j.$(value).find('[title="Permalink"]').attr('href'),
        'https://myanimelist.net',
      );

      const moreNumber = Number(
        j.$(value).find('.js-similar-recommendations-button strong').text() || 0,
      );

      res.push({
        entry: {
          title: titleName || '',
          url: titleHref || '',
          image: imageUrl || '',
        },
        user: {
          name: username,
          href: userHref,
        },
        body: {
          text,
          more: {
            url: moreUrl,
            number: moreNumber,
          },
        },
      });
    });

    const useEnglishTitle = api.settings.get('forceEnglishTitles');
    await Promise.all(
      res.map(async recommendation => {
        const type = utils.urlPart(recommendation.entry.url, 3) as 'anime' | 'manga';
        const id = Number(utils.urlPart(recommendation.entry.url, 4));

        const dbEntry = await api.request.database('entryByMalId', {
          id,
          type,
        });
        const syncMode = getSyncMode(type);
        const canForceEnglish =
          useEnglishTitle &&
          Boolean(api.settings.get('malToken')) &&
          (syncMode === 'MAL' || syncMode === 'MALAPI');
        if (dbEntry) {
          recommendation.entry.list = {
            status: dbEntry.status,
            score: dbEntry.score,
            episode: dbEntry.watchedEp,
          };
          if (canForceEnglish && dbEntry.title) {
            recommendation.entry.title = dbEntry.title;
            return;
          }
        }
        if (canForceEnglish && id && (type === 'anime' || type === 'manga')) {
          try {
            const entry = await apiCall.call(
              { apiCall },
              {
                type: 'GET',
                path: `${type}/${id}`,
                fields: ['title', 'alternative_titles'],
              },
            );
            const display = getMalDisplayTitle(entry);
            if (display) {
              recommendation.entry.title = display;
            }
          } catch (e) {
            con.m('review').error(e);
          }
        }
      }),
    );
  } catch (e) {
    con.m('review').error(e);
  }

  return res;
}
