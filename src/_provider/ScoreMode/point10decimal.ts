import { ScoreModeStrategy } from './ScoreModeStrategy';

export const point10decimal: ScoreModeStrategy = {
  ui: {
    module: 'dropdown',
  },
  getOptions() {
    const resArr = [{ value: 0, label: api.storage.lang('UI_Score_Not_Rated') }];
    for (let i = 1; i < 11; i++) {
      resArr.push({
        value: i * 10,
        label: (i / 2).toFixed(1).toString(),
      });
    }
    return resArr;
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
