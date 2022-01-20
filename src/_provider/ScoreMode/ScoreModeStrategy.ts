import { score100 } from '../definitions';

export interface ScoreModeStrategy {
  getOptions(): ScoreOption[];
  valueToOptionValue(value: score100): ScoreOption['value'];
  optionValueToValue(optionValue: ScoreOption['value']): score100;
}

export type ScoreOption = {
  value: number;
  label: string;
};
