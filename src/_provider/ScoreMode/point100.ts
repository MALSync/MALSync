import { ScoreModeStrategy } from './ScoreModeStrategy';

export const point100: ScoreModeStrategy = {
  ui: {
    module: 'input',
    pattern: '^([0-9]{1,2}|100)$',
  },
  getOptions() {
    const resArr = [{ value: 0, label: api.storage.lang('UI_Score_Not_Rated') }];
    for (let i = 1; i < 101; i++) {
      resArr.push({ value: i, label: String(i) });
    }
    return resArr;
  },
  valueToOptionValue(value) {
    if (!value) return 0;
    return Number(value);
  },
  optionValueToValue(optionValue) {
    if (!optionValue) return 0;
    return Number(optionValue);
  },
};
