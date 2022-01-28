import { ScoreModeStrategy } from './ScoreModeStrategy';

export const point10: ScoreModeStrategy = {
  ui: {
    module: 'dropdown',
  },
  getOptions() {
    return [
      { value: 0, label: api.storage.lang('UI_Score_Not_Rated') },
      { value: 100, label: api.storage.lang('UI_Score_Masterpiece') },
      { value: 90, label: api.storage.lang('UI_Score_Great') },
      { value: 80, label: api.storage.lang('UI_Score_VeryGood') },
      { value: 70, label: api.storage.lang('UI_Score_Good') },
      { value: 60, label: api.storage.lang('UI_Score_Fine') },
      { value: 50, label: api.storage.lang('UI_Score_Average') },
      { value: 40, label: api.storage.lang('UI_Score_Bad') },
      { value: 30, label: api.storage.lang('UI_Score_VeryBad') },
      { value: 20, label: api.storage.lang('UI_Score_Horrible') },
      { value: 10, label: api.storage.lang('UI_Score_Appalling') },
    ];
  },
  valueToOptionValue(value) {
    if (!value) return 0;
    if (value < 10) return 10;
    return Math.round(value / 10) * 10;
  },
  optionValueToValue(optionValue) {
    if (!optionValue) return 0;
    return Number(optionValue);
  },
};
