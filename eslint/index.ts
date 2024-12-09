'use strict';

export const rules = {
  'no-xss-jquery': require('./rules/no-xss-jquery'),
};
export const configs = {
  default: {
    rules: {
      "no-xss-jquery": 2,
    }
  }
};
