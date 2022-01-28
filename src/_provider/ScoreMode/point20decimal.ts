import { ScoreModeStrategy } from './ScoreModeStrategy';

export const point20decimal: ScoreModeStrategy = {
  ui: {
    module: 'dropdown',
  },
  getOptions() {
    const resArr = [{ value: 0, label: api.storage.lang('UI_Score_Not_Rated') }];
    for (let i = 2; i < 21; i++) {
      resArr.push({
        value: i * 5,
        label: (i / 2).toFixed(1).toString(),
      });
    }
    return resArr;
  },
  valueToOptionValue(value) {
    if (!value) return 0;
    if (value < 10) return 10;
    return Math.round(Number(value) / 5) * 5;
  },
  optionValueToValue(optionValue) {
    if (!optionValue) return 0;
    return Number(optionValue);
  },
};
