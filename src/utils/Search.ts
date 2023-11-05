import { search } from '../_provider/searchFactory';
import { searchResult } from '../_provider/definitions';

export async function normalSearch(
  searchterm: string,
  type: 'anime' | 'manga',
): Promise<searchResult[]> {
  return search(searchterm, type).then(res =>
    Promise.all(
      res.map(async el => {
        const dbEntry = await api.request.database('entry', { id: el.id, type });
        if (dbEntry) {
          el.list = {
            status: dbEntry.status,
            score: dbEntry.score,
            episode: dbEntry.watchedEp,
          };
        }
        return el;
      }),
    ),
  );
}
