import type { flashm } from '../../utils/general';
import type { SyncPage } from '../syncPage';

export type ProgressElement = {
  progress: number;
  progressTrigger?: number;
};

export interface TrackingModeInterface {
  /** Waits for a tracking action to occur */
  waitForTrackingAction(): Promise<void>;

  start(page: SyncPage): void | Promise<void>;

  stop(): void;

  flashOptions(): Exclude<Parameters<typeof flashm>[1], undefined>;

  note?(): string | null;

  addListener?(callback: (progress: ProgressElement) => void): void;

  addErrorListener?(callback: (error: HTMLElement | null) => void): void;
}
