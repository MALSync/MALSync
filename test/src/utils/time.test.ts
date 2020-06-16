import { expect } from 'chai';
import * as timeM from '../../../src/utils/time';

describe('msToTime', function() {
  const times = [
    {
      ms: (1000),
      result: {
        y: 0,
        d: 0,
        h: 0,
        m: 0,
        s: 1,
      }
    },
    {
      ms: (60 * 1000),
      result: {
        y: 0,
        d: 0,
        h: 0,
        m: 1,
        s: 0,
      }
    },
    {
      ms: (60 * 60 * 1000),
      result: {
        y: 0,
        d: 0,
        h: 1,
        m: 0,
        s: 0,
      }
    },
    {
      ms: (24 * 60 * 60 * 1000),
      result: {
        y: 0,
        d: 1,
        h: 0,
        m: 0,
        s: 0,
      }
    },
    {
      ms: (365 * 24 * 60 * 60 * 1000),
      result: {
        y: 1,
        d: 0,
        h: 0,
        m: 0,
        s: 0,
      }
    },
    {
      ms: (1000) + (60 * 1000) + (60 * 60 * 1000) + (24 * 60 * 60 * 1000) + (365 * 24 * 60 * 60 * 1000),
      result: {
        y: 1,
        d: 1,
        h: 1,
        m: 1,
        s: 1,
      }
    },
  ];

  times.forEach(function(time) {
    it(time.ms.toString(), function() {
      const res = timeM.msToTime(time.ms);
      expect(res).to.eql(time.result);
    });

  });
});
