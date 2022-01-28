import { score100 } from '../definitions';

type input = {
  module: 'input';
  pattern: string;
};

type dropdown = {
  module: 'dropdown';
};

type click = {
  module: 'click';
  type: 'star' | 'smiley';
};

type ui = dropdown | input | click;

export interface ScoreModeStrategy {
  getOptions(): ScoreOption[];
  valueToOptionValue(value: score100): ScoreOption['value'];
  optionValueToValue(optionValue: ScoreOption['value']): score100;
  ui: ui;
}

export type ScoreOption = {
  value: number;
  label: string;
};
