import { Cache } from '../../utils/Cache';
import { Queries } from './queries';
import type { CurrentUser, CurrentUserV2 } from './types';

export const domain = 'https://shikimori.one';

export async function userIDRequest(apiType?: 'REST' | 'GRAPHQL') {
  const cacheObj = new Cache<string>('shiki/userId', 4 * 60 * 60 * 1000);

  if (await cacheObj.hasValue()) {
    return cacheObj.getValue();
  }

  const res = await Queries.CurrentUser(apiType);
  let id: string | undefined;
  if ((res as CurrentUserV2).id) {
    id = String((res as CurrentUserV2).id);
  } else if ((res as CurrentUser).data) {
    id = String((res as CurrentUser).data.currentUser.id);
  }
  if (id) {
    await cacheObj.setValue(id);
  }

  return id;
}

export function title(rus: string, eng: string, headline = false) {
  const options = api.settings.get('shikiOptions');
  const locale = options && options.locale ? options.locale : 'ru';
  if (locale === 'ru') return rus || eng;
  if (headline && eng && rus) return `${eng} / ${rus}`;
  return eng || rus;
}
