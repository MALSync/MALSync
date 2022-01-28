import { ScoreModeStrategy } from './ScoreModeStrategy';

export const stars5: ScoreModeStrategy = {
  ui: {
    module: 'click',
    type: 'star',
  },
  getOptions() {
    return [
      { value: 0, label: api.storage.lang('UI_Score_Not_Rated') },
      { value: 90, label: '★★★★★' },
      { value: 70, label: '★★★★' },
      { value: 50, label: '★★★' },
      { value: 30, label: '★★' },
      { value: 10, label: '★' },
    ];
  },
  valueToOptionValue(value) {
    if (!value) return 0;
    if (value < 20) return 10;
    if (value < 40) return 30;
    if (value < 60) return 50;
    if (value < 80) return 70;
    return 90;
  },
  optionValueToValue(optionValue) {
    if (!optionValue) return 0;
    return Number(optionValue);
  },
};
