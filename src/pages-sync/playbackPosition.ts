import { PlayerSingleton } from '../utils/player';
import { localStore } from '../utils/localStore';
import { resumeMessageElement } from './messageElements';
import type { ProgressElement } from './trackingMode/TrackingModeInterface';

const logger = con.m('Resume', '#348fff');

/** Below this many seconds there is nothing worth resuming to. */
const MIN_RESUME_SECONDS = 45;

const SAVE_INTERVAL = 10 * 1000;

/** How close the player has to land for a seek to count as having happened. */
const RESUME_TOLERANCE = 3;

/** Grace period before telling the user the seek did not take, in ms. */
const RESUME_HINT_DELAY = 2500;

/**
 * Remembers where playback stopped so the position can be offered again on the next visit.
 *
 * Deliberately not part of the tracking modes: which mode is selected decides *when the
 * list gets updated*, which has nothing to do with whether the position is worth
 * remembering. Keeping it separate means `instant` and `manual` get it too, and that it
 * survives the cases where there is nothing to sync at all — a rewatch, or an episode
 * already marked as watched.
 *
 * Source agnostic on purpose. The caller feeds it through `report()`, so video progress
 * comes from the player while manga progress keeps coming from its own tracking mode.
 */
export class PlaybackPosition {
  private saved: ProgressElement | null = null;

  /** Set once the prompt has been acted on, so it is offered only once per visit. */
  private resumed = false;

  /** Held while playback is behind the stored position, to avoid overwriting it. */
  private saveBlocked = false;

  private saveDebounce = true;

  private finished = false;

  private stopped = false;

  /** Seek target while a resume has been asked for but not observed yet. */
  private pendingResume: number | null = null;

  private hintTimeout: NodeJS.Timeout | null = null;

  /**
   * @param key storage key, unique per entry and episode
   * @param allowResume whether a resume prompt may be shown. Off for readers, where
   *   there is no player to seek.
   */
  constructor(
    private readonly key: string,
    private readonly allowResume = true,
  ) {}

  /** Reads what a previous visit stored. Call before the first `report()`. */
  start() {
    this.saved = this.read();
    this.resumed = !this.saved;
    this.saveBlocked = Boolean(this.saved);
    if (this.saved) logger.debug('Stored position', this.saved);
  }

  /** The stored position, for the ghost bar on the tracking UI. */
  getSaved() {
    return this.saved;
  }

  report(progress: ProgressElement) {
    if (this.stopped || this.finished) return;

    this.confirmResume(progress);

    // Caught up with the stored position: stop holding back saves, drop the prompt.
    if (this.saveBlocked && this.saved && progress.progress >= this.saved.progress) {
      this.saveBlocked = false;
      if (!this.resumed && j.$('#MALSyncResume').length) {
        this.resumed = true;
        j.$('#MALSyncResume').parentsUntil('.flash').remove();
      }
    }

    // The episode has been watched through, there is nothing left to come back to.
    const trigger = Number(progress.progressTrigger);
    if (trigger && progress.progress >= trigger) {
      this.finished = true;
      this.clear();
      return;
    }

    if (this.offerResume()) return;

    this.persist(progress);
  }

  /**
   * Seeking is fire and forget — `setTime` posts a message to the player frame and gets
   * nothing back, and it is simply dropped when that frame has no player yet, which is
   * what happens when the video has not been started. So the prompt stays up until the
   * player is actually seen at the requested position, leaving the offer clickable again
   * once playback has begun.
   */
  private confirmResume(progress: ProgressElement) {
    if (this.pendingResume === null) return;
    if (progress.current < this.pendingResume - RESUME_TOLERANCE) return;

    logger.log('Resumed at', progress.current);
    this.pendingResume = null;
    this.clearHint();
    this.resumed = true;
    this.saveBlocked = false;
    j.$('#MALSyncResume').parentsUntil('.flash').remove();
  }

  /**
   * Nothing comes back from a dropped seek, so tell the user what to do about it rather
   * than leaving a prompt that looks unresponsive.
   */
  private scheduleHint() {
    this.clearHint();
    this.hintTimeout = setTimeout(() => {
      if (this.pendingResume === null) return;
      utils.flashm(api.storage.lang('syncPage_flashm_resumePlay'), { type: 'resumeHint' });
    }, RESUME_HINT_DELAY);
  }

  private clearHint() {
    if (this.hintTimeout) {
      clearTimeout(this.hintTimeout);
      this.hintTimeout = null;
    }
  }

  /** @returns true when a prompt is on screen, so saving is left alone this tick. */
  private offerResume(): boolean {
    if (!this.allowResume || this.resumed) return false;

    const { saved } = this;
    if (!saved || !saved.current || saved.current < MIN_RESUME_SECONDS) {
      // Too short to be worth resuming, and it will not grow — stop checking.
      this.resumed = true;
      this.saveBlocked = false;
      return false;
    }

    // No way to seek yet. Keep the offer pending rather than dropping it, an iframe
    // player only becomes seekable once it has reported in.
    if (!PlayerSingleton.getInstance().canSetTime()) return false;

    if (j.$('#MALSyncResume').length) return true;

    if (api.settings.get('autoresume')) {
      this.resumeTo(saved);
      this.resumed = true;
      return true;
    }

    const message = resumeMessageElement(
      api.storage.lang('syncPage_flashm_resumeMsg', [PlaybackPosition.formatTime(saved.current)]),
    );

    const prompt = utils.flashm(message.innerHTML, {
      permanent: true,
      error: false,
      type: 'resume',
      minimized: false,
      position: 'top',
    });

    prompt.find('.sync').on('click', () => {
      this.pendingResume = saved.current!;
      this.resumeTo(saved);
      this.scheduleHint();
    });

    prompt.find('.resumeClose').on('click', () => {
      this.pendingResume = null;
      this.clearHint();
      this.resumed = true;
      this.saveBlocked = false;
      prompt.remove();
    });

    return true;
  }

  private persist(progress: ProgressElement) {
    if (this.saveBlocked || !this.saveDebounce) return;

    logger.debug('Set Resume', progress);
    localStore.setItem(this.key, JSON.stringify(progress));

    this.saveDebounce = false;
    setTimeout(() => {
      this.saveDebounce = true;
    }, SAVE_INTERVAL);
  }

  private resumeTo(state: ProgressElement) {
    if (!state.current) return;
    logger.log('Resume to', state.current);
    PlayerSingleton.getInstance().setTime(state.current);
  }

  private read(): ProgressElement | null {
    const stored = localStore.getItem(this.key);
    if (!stored) return null;
    try {
      return JSON.parse(stored) as ProgressElement;
    } catch (e) {
      logger.error('Could not read the stored position', e);
      localStore.removeItem(this.key);
      return null;
    }
  }

  clear() {
    logger.debug('Clear', this.key);
    localStore.removeItem(this.key);
    this.saved = null;
  }

  stop() {
    this.stopped = true;
    this.pendingResume = null;
    this.clearHint();
    j.$('#MALSyncResume').parentsUntil('.flash').remove();
  }

  static formatTime(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const sec = Math.floor(seconds - minutes * 60);
    return `${minutes}:${String(sec).padStart(2, '0')}`;
  }
}
