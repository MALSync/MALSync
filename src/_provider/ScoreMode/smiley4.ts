import { ScoreModeStrategy } from './ScoreModeStrategy';

export const smiley4: ScoreModeStrategy = {
  ui: {
    module: 'click',
    type: 'smiley',
  },
  getOptions() {
    return [
      { value: 0, label: api.storage.lang('UI_Score_Not_Rated') },
      { value: 100, label: '😀' },
      { value: 70, label: '🙂' },
      { value: 40, label: '😐' },
      { value: 10, label: '🙁' },
    ];
  },
  valueToOptionValue(value) {
    if (!value) return 0;
    if (value < 25) return 10;
    if (value < 55) return 40;
    if (value < 85) return 70;
    return 100;
  },
  optionValueToValue(optionValue) {
    if (!optionValue) return 0;
    return Number(optionValue);
  },
};
