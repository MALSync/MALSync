'use strict';

module.exports = {
  rules: {
    'no-xss-jquery': require('./rules/no-xss-jquery'),
  },
  configs: {
    default: {
      rules: {
        "no-xss-jquery": 2,
      }
    }
  }
}
