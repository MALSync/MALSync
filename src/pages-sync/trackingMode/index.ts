import { InstantStrategy } from './InstantStrategy';
import { ManualStrategy } from './ManualStrategy';
import { VideoStrategy } from './VideoStrategy';

export type TrackingModeType = 'instant' | 'manual' | 'video';

const trackingModes = {
  instant: InstantStrategy,
  manual: ManualStrategy,
  video: VideoStrategy,
};

export function getTrackingMode(mode: TrackingModeType) {
  return trackingModes[mode];
}
