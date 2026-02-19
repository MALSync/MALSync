import { InstantStrategy } from './InstantStrategy';
import { MangaStrategy } from './MangaStrategy';
import { ManualStrategy } from './ManualStrategy';
import { VideoStrategy } from './VideoStrategy';

export type TrackingModeType = 'instant' | 'manual' | 'video' | 'manga';

const trackingModes = {
  instant: InstantStrategy,
  manual: ManualStrategy,
  video: VideoStrategy,
  manga: MangaStrategy,
};

export function getTrackingMode(mode: TrackingModeType) {
  return trackingModes[mode];
}
