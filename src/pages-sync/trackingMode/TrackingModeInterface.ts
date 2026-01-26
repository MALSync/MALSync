import type { flashm } from '../../utils/general';

export interface TrackingModeInterface {
  /** Waits for a tracking action to occur */
  waitForTrackingAction(): Promise<void>;

  start(): void;

  stop(): void;

  flashOptions(): Exclude<Parameters<typeof flashm>[1], undefined>;

  note?(): string | null;
}
