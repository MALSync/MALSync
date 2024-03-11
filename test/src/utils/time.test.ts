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

describe('shortTime', function() {
  const times = [
    {
      name: 'Year round up',
      input: {
        y: 2,
        d: 200,
        h: 20,
        m: 50,
        s: 50,
      },
      result: {
        y: 3,
        d: 0,
        h: 0,
        m: 0,
        s: 0,
      }
    },
    {
      name: 'Year round down',
      input: {
        y: 3,
        d: 20,
        h: 20,
        m: 50,
        s: 50,
      },
      result: {
        y: 3,
        d: 0,
        h: 0,
        m: 0,
        s: 0,
      }
    },
    {
      name: 'Year day',
      input: {
        y: 1,
        d: 20,
        h: 20,
        m: 50,
        s: 50,
      },
      result: {
        y: 1,
        d: 20,
        h: 0,
        m: 0,
        s: 0,
      }
    },
    {
      name: 'Year day',
      input: {
        y: 1,
        d: 20,
        h: 20,
        m: 50,
        s: 50,
      },
      result: {
        y: 1,
        d: 20,
        h: 0,
        m: 0,
        s: 0,
      }
    },

    {
      name: 'Day round up',
      input: {
        y: 0,
        d: 200,
        h: 20,
        m: 50,
        s: 50,
      },
      result: {
        y: 0,
        d: 201,
        h: 0,
        m: 0,
        s: 0,
      }
    },
    {
      name: 'Day round down',
      input: {
        y: 0,
        d: 4,
        h: 11,
        m: 50,
        s: 50,
      },
      result: {
        y: 0,
        d: 4,
        h: 0,
        m: 0,
        s: 0,
      }
    },
    {
      name: 'Day hour',
      input: {
        y: 0,
        d: 3,
        h: 20,
        m: 50,
        s: 50,
      },
      result: {
        y: 0,
        d: 3,
        h: 20,
        m: 0,
        s: 0,
      }
    },

    {
      name: 'Hour round up',
      input: {
        y: 0,
        d: 0,
        h: 20,
        m: 50,
        s: 50,
      },
      result: {
        y: 0,
        d: 0,
        h: 21,
        m: 0,
        s: 0,
      }
    },
    {
      name: 'Hour round down',
      input: {
        y: 0,
        d: 0,
        h: 6,
        m: 29,
        s: 50,
      },
      result: {
        y: 0,
        d: 0,
        h: 6,
        m: 0,
        s: 0,
      }
    },
    {
      name: 'Hour minute',
      input: {
        y: 0,
        d: 0,
        h: 5,
        m: 32,
        s: 50,
      },
      result: {
        y: 0,
        d: 0,
        h: 5,
        m: 32,
        s: 0,
      }
    },

    {
      name: 'Minute',
      input: {
        y: 0,
        d: 0,
        h: 0,
        m: 32,
        s: 50,
      },
      result: {
        y: 0,
        d: 0,
        h: 0,
        m: 32,
        s: 0,
      }
    },
    {
      name: 'Minute Second',
      input: {
        y: 0,
        d: 0,
        h: 0,
        m: 14,
        s: 50,
      },
      result: {
        y: 0,
        d: 0,
        h: 0,
        m: 14,
        s: 50,
      }
    },
    {
      name: 'Second',
      input: {
        y: 0,
        d: 0,
        h: 0,
        m: 0,
        s: 50,
      },
      result: {
        y: 0,
        d: 0,
        h: 0,
        m: 0,
        s: 50,
      }
    },
  ];

  times.forEach(function(time) {
    it(time.name, function() {
      const res = timeM.shortTime(time.input);
      expect(res).to.eql(time.result);
    });

  });
});

describe('shortTime', function() {
  before(function() {
    global.api = {
      storage: {
        lang: function(key, array) {
          if(key === 'bookmarksItem_ago') {
            return array[0] + ' ago';
          }
          const val = {
            "bookmarksItem_Year": "y",
            "bookmarksItem_Years": "ys",
            "bookmarksItem_Day": "d",
            "bookmarksItem_Days": "ds",
            "bookmarksItem_Hour": "h",
            "bookmarksItem_Hours": "hs",
            "bookmarksItem_min": "m",
            "bookmarksItem_mins": "ms",
            "bookmarksItem_sec": "s",
            "bookmarksItem_secs": "ss",
            "bookmarksItem_now": "n",
          };
          return val[key];
        }
      }
    }
  });

  const times = [
    {
      input: {
        y: 2,
        d: 200,
        h: 20,
        m: 50,
        s: 50,
      },
      result: '2 ys 200 ds 20 hs 50 ms 50 ss'
    },
    {
      input: {
        y: 1,
        d: 1,
        h: 1,
        m: 1,
        s: 1,
      },
      result: '1 y 1 d 1 h 1 m 1 s'
    },
    {
      input: {
        y: 0,
        d: 10,
        h: 0,
        m: 23,
        s: 10,
      },
      result: '10 ds 23 ms 10 ss'
    },
    {
      input: {
        y: 1,
        d: 0,
        h: 2,
        m: 0,
        s: 17,
      },
      result: '1 y 2 hs 17 ss'
    },
  ];

  times.forEach(function(time) {
    it(time.result, function() {
      const res = timeM.timeToString(time.input);
      expect(res).equal(time.result);
    });
  });

  it('msDiffToShortTimeString', function() {
    const res = timeM.msDiffToShortTimeString((1000) + (60 * 1000) + (60 * 60 * 1000) + (24 * 60 * 60 * 1000) + (365 * 24 * 60 * 60 * 1000));
    expect(res).equal('1 y 1 d');
  })
  describe('timestampToShortTime', function() {
    it('0', function() {
      const res = timeM.timestampToShortTime(0);
      expect(res).equal('');
    })
    it('Now', function() {
      const res = timeM.timestampToShortTime(Date.now() + 1000);
      expect(res).equal('n');
    })
    it('Now past', function() {
      const res = timeM.timestampToShortTime(Date.now() - 1000);
      expect(res).equal('n');
    })
    it('+2d', function() {
      const res = timeM.timestampToShortTime(Date.now() + (2 * 24 * 61 * 60 * 1000));
      expect(res).equal('2 ds');
    })
    it('-2d', function() {
      const res = timeM.timestampToShortTime(Date.now() - (2 * 24 * 61 * 60 * 1000));
      expect(res).equal('2 ds ago');
    })
    it('+1y', function() {
      const res = timeM.timestampToShortTime(Date.now() + (365 * 24 * 60 * 60 * 1000));
      expect(res).equal('1 y');
    })
    it('-1y', function() {
      const res = timeM.timestampToShortTime(Date.now() - (365 * 24 * 60 * 60 * 1000));
      expect(res).equal('1 y ago');
    })
  });


});

