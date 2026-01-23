import type { SingleAbstract } from '../singleAbstract';
import { call, urls } from './helper';
import type { BakaSeries } from './types';
import { Cache } from '../../utils/Cache';

type SeriesRelations = {
  ani: { [aniId: number]: number };
  mal: { [malId: number]: number };
};

const relationCache = new Cache<SeriesRelations>(
  'mangabaka/series/relations/v1',
  7 * 24 * 60 * 60 * 1000,
);

function getSeriesCache(bakaId: number) {
  return new Cache<BakaSeries>(`mangabaka/series/v1/${bakaId}`, 2 * 24 * 60 * 60 * 1000);
}

export async function cacheSeries(series: BakaSeries) {
  const seriesCache = getSeriesCache(series.id);

  if (await seriesCache.hasValue()) {
    return;
  }

  await seriesCache.setValue(series);

  let relations: SeriesRelations;
  if (await relationCache.hasValue()) {
    relations = (await relationCache.getValue())!;
  } else {
    relations = { ani: {}, mal: {} };
  }

  if (series.source?.anilist?.id) {
    relations.ani[series.source.anilist.id] = series.id;
  }
  if (series.source?.my_anime_list?.id) {
    relations.mal[series.source.my_anime_list.id] = series.id;
  }

  await relationCache.setValue(relations);
}

export async function cacheSeriesList(seriesList: BakaSeries[]) {
  await Promise.all(seriesList.map(series => cacheSeries(series)));
  return seriesList;
}

export async function getSeries(ids: Partial<SingleAbstract['ids']>) {
  if (!ids.baka && (await relationCache.hasValue())) {
    if (ids.ani) {
      const relations = await relationCache.getValue();
      if (relations && relations.ani[ids.ani]) {
        ids.baka = relations.ani[ids.ani];
      }
    } else if (ids.mal) {
      const relations = await relationCache.getValue();
      if (relations && relations.mal[ids.mal]) {
        ids.baka = relations.mal[ids.mal];
      }
    }
  }

  let seriesEntry: BakaSeries;
  if (ids.baka) {
    const seriesCache = getSeriesCache(ids.baka);
    if (await seriesCache.hasValue()) {
      return seriesCache.getValue();
    }
    seriesEntry = (await call(urls.series(ids.baka))).data as BakaSeries;
  } else if (ids.ani) {
    seriesEntry = (await call(urls.seriesByAniId(ids.ani))).data.series[0] as BakaSeries;
  } else if (ids.mal) {
    seriesEntry = (await call(urls.seriesByMalId(ids.mal))).data.series[0] as BakaSeries;
  } else {
    throw new Error('No valid ID found');
  }

  await cacheSeries(seriesEntry);

  return seriesEntry;
}
