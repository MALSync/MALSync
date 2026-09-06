import { SingleAbstract } from './singleAbstract';
import * as definitions from './definitions';

export interface LiveCheckResult {
  name: string;
  pass: boolean;
  error?: string;
}

/**
 * Manual, developer-triggered sanity check for a provider's real sync/update
 * path - see src/_minimal/views/test.vue. Deliberately not part of the
 * automated test suite: it needs a real logged-in account and mutates a real
 * list entry, which is always deleted again at the end (regardless of
 * outcome) - only makes sense run by hand against a dedicated, throwaway entry.
 */
export async function runLiveSyncCheck(
  Single: new (url: string) => SingleAbstract,
  url: string,
): Promise<LiveCheckResult[]> {
  const results: LiveCheckResult[] = [];

  async function run(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      results.push({ name, pass: true });
    } catch (e) {
      results.push({ name, pass: false, error: e.message || String(e) });
    }
  }

  try {
    await run("Persistence (sync sticks, later local edits without syncing don't)", async () => {
      const single = new Single(url);
      await single.update();
      single.setScore(definitions.score.R5).setStatus(definitions.status.Watching).setEpisode(2);
      await single.sync();

      single.setScore(definitions.score.R6).setStatus(definitions.status.Completed).setEpisode(3);
      if (single.getScore() !== definitions.score.R6)
        throw new Error('local score edit did not stick locally');
      if (single.getStatus() !== definitions.status.Completed)
        throw new Error('local status edit did not stick locally');

      await single.update();
      if (single.getScore() !== definitions.score.R5)
        throw new Error(`expected synced score R5, got ${single.getScore()}`);
      if (single.getStatus() !== definitions.status.Watching)
        throw new Error(`expected synced status Watching, got ${single.getStatus()}`);
      if (single.getEpisode() !== 2)
        throw new Error(`expected synced episode 2, got ${single.getEpisode()}`);
    });

    await run('Undo reverts a sync', async () => {
      const single = new Single(url);
      await single.update();
      const tempState = {
        episode: single.getEpisode(),
        volume: single.getVolume(),
        status: single.getStatus(),
        score: single.getScore(),
      };

      single.setScore(definitions.score.R6).setStatus(definitions.status.PlanToWatch).setEpisode(2);
      await single.sync();
      await single.undo();
      await single.update();

      if (single.getScore() !== tempState.score) throw new Error('score was not restored by undo');
      if (single.getStatus() !== tempState.status)
        throw new Error('status was not restored by undo');
      if (single.getEpisode() !== tempState.episode)
        throw new Error('episode was not restored by undo');
      if (single.getVolume() !== tempState.volume)
        throw new Error('volume was not restored by undo');
    });

    await run('Episode beyond total is handled (clamped if total is known)', async () => {
      const single = new Single(url);
      await single.update();
      const total = single.getTotalEpisodes();
      single.setScore(definitions.score.R5).setStatus(definitions.status.Watching).setEpisode(1000);
      await single.sync();
      await single.update();

      if (total) {
        if (single.getEpisode() !== total)
          throw new Error(
            `entry has ${total} total episodes, expected clamp to it, got ${single.getEpisode()}`,
          );
      } else if (single.getEpisode() !== 1000) {
        throw new Error(`entry has no known total, expected no clamp, got ${single.getEpisode()}`);
      }
    });
  } finally {
    await run('Delete test entry', async () => {
      const single = new Single(url);
      await single.update();
      await single.delete();
    });
  }

  return results;
}
