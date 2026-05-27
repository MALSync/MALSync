import { status } from '../definitions';
import { NotAutenticatedError, parseJson, ServerOfflineError } from '../Errors';

const BASE_URL = 'https://myanimepulse.com/api';

export function translateList(pulseStatus: string, malStatus: null | number = null) {
  const list: Record<string, number> = {
    WATCHING: status.Watching,
    COMPLETED: status.Completed,
    ON_HOLD: status.Onhold,
    DROPPED: status.Dropped,
    PLAN_TO_WATCH: status.PlanToWatch,
  };

  if (malStatus !== null) {
    // MyAnimePulse has no "rewatching" status; surface an in-progress rewatch as Watching.
    if (malStatus === status.Rewatching) return 'WATCHING';
    return Object.keys(list).find(key => list[key] === malStatus) || 'PLAN_TO_WATCH';
  }
  return list[pulseStatus] ?? status.PlanToWatch;
}

export function getCacheKey(malId: number) {
  return malId;
}

export async function apiCall(
  endpoint: string,
  data: any = {},
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
): Promise<any> {
  const token = await api.settings.getAsync('animepulseToken');
  if (!token) {
    throw new NotAutenticatedError('MyAnimePulse token not found');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const url = `${BASE_URL}${endpoint}`;

  try {
    const response = await api.request.xhr(method, {
      url,
      headers,
      data: method !== 'GET' ? JSON.stringify(data) : undefined,
    });

    if (response.status >= 500) {
      throw new ServerOfflineError('MyAnimePulse server error');
    }

    if (response.status === 401) {
      throw new NotAutenticatedError('MyAnimePulse token expired');
    }

    if (response.status >= 400) {
      const err: any = new Error(`MyAnimePulse API error ${response.status}`);
      err.status = response.status;
      throw err;
    }

    return parseJson(response.responseText);
  } catch (e: any) {
    if (e instanceof NotAutenticatedError || e instanceof ServerOfflineError) throw e;
    if (e?.status) throw e;
    throw new ServerOfflineError(`MyAnimePulse API error: ${e}`);
  }
}
