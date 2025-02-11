import { expect } from 'chai';
import * as intl from '../../../src/utils/IntlWrapper';

describe('IntlWrapper', function() {
  const dateNow = Date.now();
  this.beforeAll(function() {
    Date.now = () => dateNow;
    global.api = {
      storage: {
        lang: function(key, array) {
          if(key === 'locale') {
            return 'en';
          }
          if(key === 'bookmarksItem_ago') {
            return array[0] + ' ago';
          }
          if(key === 'bookmarksItem_now') {
            return 'now';
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
          };
          return val[key];
        }
      }
    }
  });
  describe('shortTime', function() {
    const times: { name: string, input: intl.DurationFormat, result: intl.DurationFormat }[] = [
      {
        name: 'Year round up',
        input: {
          years: 2,
          days: 200,
          hours: 20,
          minutes: 50,
          seconds: 50,
        },
        result: { years: 3 }
      },
      {
        name: 'Year round down',
        input: {
          years: 3,
          days: 20,
          hours: 20,
          minutes: 50,
          seconds: 50,
        },
        result: { years: 3 }
      },
      {
        name: 'Year day',
        input: {
          years: 1,
          days: 20,
          hours: 20,
          minutes: 50,
          seconds: 50,
        },
        result: {
          years: 1,
          days: 20,
        }
      },
      {
        name: 'Year day',
        input: {
          years: 1,
          days: 20,
          hours: 20,
          minutes: 50,
          seconds: 50,
        },
        result: {
          years: 1,
          days: 20,
        }
      },
  
      {
        name: 'Day round up',
        input: {
          days: 200,
          hours: 20,
          minutes: 50,
          seconds: 50,
        },
        result: {
          days: 201,
        }
      },
      {
        name: 'Day round down',
        input: {
          days: 4,
          hours: 11,
          minutes: 50,
          seconds: 50,
        },
        result: {
          days: 4,
        }
      },
      {
        name: 'Day hour',
        input: {
          days: 3,
          hours: 20,
          minutes: 50,
          seconds: 50,
        },
        result: {
          days: 3,
          hours: 20,
        }
      },
  
      {
        name: 'Hour round up',
        input: {
          hours: 20,
          minutes: 50,
          seconds: 50,
        },
        result: {
          hours: 21,
        }
      },
      {
        name: 'Hour round down',
        input: {
          hours: 6,
          minutes: 29,
          seconds: 50,
        },
        result: {
          hours: 6,
        }
      },
      {
        name: 'Hour minute',
        input: {
          hours: 5,
          minutes: 32,
          seconds: 50,
        },
        result: {
          hours: 5,
          minutes: 32,
        }
      },
  
      {
        name: 'Minute',
        input: {
          minutes: 32,
          seconds: 50,
        },
        result: {
          minutes: 32,
        }
      },
      {
        name: 'Minute Second',
        input: {
          minutes: 14,
          seconds: 50,
        },
        result: {
          minutes: 14,
          seconds: 50,
        }
      },
      {
        name: 'Second',
        input: {
          seconds: 50,
        },
        result: {
          minutes: 0,
          seconds: 50,
        }
      },
    ];
  
    times.forEach(function(time) {
      it(time.name, function() {
        const res = intl.shortTime(time.input);
        expect(res).to.eql(time.result);
      });
  
    });
  });
  describe('durationToMs', function() {
    it('years', function() {
      const input: intl.DurationFormat = { 
        years: 10,
      };
      const result = intl.IntlDuration.durationToMs(input);
      expect(result).to.deep.equal(1000 * 60 * 60 * 24 * 365 * 10);
    })
    it('months', function() {
      const input: intl.DurationFormat = { 
        months: 10,
      };
      const result = intl.IntlDuration.durationToMs(input);
      expect(result).to.deep.equal(1000 * 60 * 60 * 24 * 30 * 10);
    })
    it('weeks', function() {
      const input: intl.DurationFormat = { 
        weeks: 10,
      };
      const result = intl.IntlDuration.durationToMs(input);
      expect(result).to.deep.equal(1000 * 60 * 60 * 24 * 7 * 10);
    })
    it('days', function() {
      const input: intl.DurationFormat = { 
        days: 10,
      };
      const result = intl.IntlDuration.durationToMs(input);
      expect(result).to.deep.equal(1000 * 60 * 60 * 24 * 10);
    })
    it('mins hours days years', function() {
      const input: intl.DurationFormat = { 
        minutes: 10,
        hours: 10,
        days: 10,
        years: 10,
      };
      const result = intl.IntlDuration.durationToMs(input);
      expect(result).to.deep.equal(1000 * 60 * 10 + 1000 * 60 * 60 * 10 + 1000 * 60 * 60 * 24 * 10 + 1000 * 60 * 60 * 24 * 365 * 10);
    })
    it('mins hours days', function() {
      const input: intl.DurationFormat = { 
        minutes: 10,
        hours: 10,
        days: 10,
      };
      const result = intl.IntlDuration.durationToMs(input);
      expect(result).to.deep.equal(1000 * 60 * 10 + 1000 * 60 * 60 * 10 + 1000 * 60 * 60 * 24 * 10);
    })
    it('mins hours', function() {
      const input: intl.DurationFormat = { 
        minutes: 10,
        hours: 10,
      };
      const result = intl.IntlDuration.durationToMs(input);
      expect(result).to.deep.equal(1000 * 60 * 10 + 1000 * 60 * 60 * 10);
    })
    it('mins', function() {
      const input: intl.DurationFormat = { 
        minutes: 10,
      };
      const result = intl.IntlDuration.durationToMs(input);
      expect(result).to.deep.equal(1000 * 60 * 10);
    })
    it('seconds', function() {
      const input: intl.DurationFormat = { 
        seconds: 10,
      };
      const result = intl.IntlDuration.durationToMs(input);
      expect(result).to.deep.equal(1000 * 10);
    })
    it('ms', function() {
      const input: intl.DurationFormat = { 
        milliseconds: 10,
      };
      const result = intl.IntlDuration.durationToMs(input);
      expect(result).to.deep.equal(10);
    })
    it('microseconds', function() {
      const input: intl.DurationFormat = { 
        microseconds: 10,
      };
      const result = intl.IntlDuration.durationToMs(input);
      expect(result).to.deep.equal(0);
    })
    it('nanoseconds', function() {
      const input: intl.DurationFormat = { 
        nanoseconds: 10,
      };
      const result = intl.IntlDuration.durationToMs(input);
      expect(result).to.deep.equal(0);
    })
  })
  describe('relativeToDuration', function() {
    describe('Future', function() {
      it('years', function() {
        const actual: { duration: intl.DurationFormat, isFuture: boolean } = { 
          duration: {
            years: 10,
          },
          isFuture: true
        };
        const result = intl.relativeToDuration(1000 * 60 * 60 * 24 * 365 * 10, ['years']);
        expect(result).to.deep.equal(actual);
      })
      it('months', function() {
        const actual: { duration: intl.DurationFormat, isFuture: boolean } = { 
          duration: {
            months: 10,
          },
          isFuture: true
        };
        const result = intl.relativeToDuration(1000 * 60 * 60 * 24 * 30 * 10, ['months']);
        expect(result).to.deep.equal(actual);
      })
      it('weeks', function() {
        const actual: { duration: intl.DurationFormat, isFuture: boolean } = { 
          duration: {
            weeks: 10,
          },
          isFuture: true
        };
        const result = intl.relativeToDuration(1000 * 60 * 60 * 24 * 7 * 10, ['weeks']);
        expect(result).to.deep.equal(actual);
      })
      it('days', function() {
        const actual: { duration: intl.DurationFormat, isFuture: boolean } = { 
          duration: {
            days: 10,
          },
          isFuture: true
        };
        const result = intl.relativeToDuration(1000 * 60 * 60 * 24 * 10, ['days']);
        expect(result).to.deep.equal(actual);
      })
      it('mins hours days years', function() {
        const actual: { duration: intl.DurationFormat, isFuture: boolean } = { 
          duration: { 
            minutes: 10,
            hours: 10,
            days: 10,
            years: 10,
          },
          isFuture: true 
        };
        const result = intl.relativeToDuration(1000 * 60 * 10 + 1000 * 60 * 60 * 10 + 1000 * 60 * 60 * 24 * 10 + 1000 * 60 * 60 * 24 * 365 * 10);
        expect(result).to.deep.equal(actual);
      })
      it('mins hours days', function() {
        const actual: { duration: intl.DurationFormat, isFuture: boolean } = { 
          duration: { 
            minutes: 10,
            hours: 10,
            days: 10,
          },
          isFuture: true 
        };
        const result = intl.relativeToDuration(1000 * 60 * 10 + 1000 * 60 * 60 * 10 + 1000 * 60 * 60 * 24 * 10, ['minutes', 'hours', 'days']);
        expect(result).to.deep.equal(actual);
      })
      it('mins hours', function() {
        const actual: { duration: intl.DurationFormat, isFuture: boolean } = { 
          duration: { 
            minutes: 10,
            hours: 10,
          },
          isFuture: true 
        };
        const result = intl.relativeToDuration(1000 * 60 * 10 + 1000 * 60 * 60 * 10, ['minutes', 'hours']);
        expect(result).to.deep.equal(actual);
      })
      it('mins', function() {
        const actual: { duration: intl.DurationFormat, isFuture: boolean } = { 
          duration: { 
            minutes: 10,
          },
          isFuture: true 
        };
        const result = intl.relativeToDuration(1000 * 60 * 10, ['minutes']);
        expect(result).to.deep.equal(actual);
      })
      it('seconds', function() {
        const actual: { duration: intl.DurationFormat, isFuture: boolean } = { 
          duration: { 
            seconds: 10,
          },
          isFuture: true 
        };
        const result = intl.relativeToDuration(1000 * 10, ['seconds']);
        expect(result).to.deep.equal(actual);
      })
      it('ms', function() {
        const actual: { duration: intl.DurationFormat, isFuture: boolean } = { 
          duration: { 
            milliseconds: 10,
          },
          isFuture: true 
        };
        const result = intl.relativeToDuration(10, ['milliseconds']);
        expect(result).to.deep.equal(actual);
      })
    });
    
    describe('Relative dates', function() {
      it('0', function() {
        const actual: { duration: intl.DurationFormat, isFuture: boolean } = { 
          duration: { 
            minutes: 0,
          },
          isFuture: false 
        };
        const result = intl.relativeToDuration(0, ['minutes']);
        expect(result).to.deep.equal(actual);
      })
      it('0 with units', function() {
        const actual: { duration: intl.DurationFormat, isFuture: boolean } = { 
          duration: { 
            minutes: 0,
            hours: 0,
            days: 0,
            years: 0,
          },
          isFuture: false 
        };
        const result = intl.relativeToDuration(0);
        expect(result).to.deep.equal(actual);
      })
      it('years future', function() {
        const relative = dateNow - 1000 * 60 * 60 * 24 * 365 * 10;
        const actual: { duration: intl.DurationFormat, isFuture: boolean } = { 
          duration: {
            years: 10,
          },
          isFuture: true
        };
        const result = intl.relativeToDuration(dateNow, ['years'], relative);
        expect(result).to.deep.equal(actual);
      })
      it('years past', function() {
        const relative = dateNow + 1000 * 60 * 60 * 24 * 365 * 10;
        const actual: { duration: intl.DurationFormat, isFuture: boolean } = { 
          duration: {
            years: 10,
          },
          isFuture: false
        };
        const result = intl.relativeToDuration(dateNow, ['years'], relative);
        expect(result).to.deep.equal(actual);
      })
      it('months future', function() {
        const relative = dateNow - 1000 * 60 * 60 * 24 * 30 * 10;
        const actual: { duration: intl.DurationFormat, isFuture: boolean } = { 
          duration: {
            months: 10,
          },
          isFuture: true
        };
        const result = intl.relativeToDuration(dateNow, ['months'], relative);
        expect(result).to.deep.equal(actual);
      })
      it('months past', function() {
        const relative = dateNow + 1000 * 60 * 60 * 24 * 30 * 10;
        const actual: { duration: intl.DurationFormat, isFuture: boolean } = { 
          duration: {
            months: 10,
          },
          isFuture: false
        };
        const result = intl.relativeToDuration(dateNow, ['months'], relative);
        expect(result).to.deep.equal(actual);
      })
      it('weeks future', function() {
        const relative = dateNow - 1000 * 60 * 60 * 24 * 7 * 10;
        const actual: { duration: intl.DurationFormat, isFuture: boolean } = { 
          duration: {
            weeks: 10,
          },
          isFuture: true
        };
        const result = intl.relativeToDuration(dateNow, ['weeks'], relative);
        expect(result).to.deep.equal(actual);
      })
      it('weeks past', function() {
        const relative = dateNow + 1000 * 60 * 60 * 24 * 7 * 10;
        const actual: { duration: intl.DurationFormat, isFuture: boolean } = { 
          duration: {
            weeks: 10,
          },
          isFuture: false
        };
        const result = intl.relativeToDuration(dateNow, ['weeks'], relative);
        expect(result).to.deep.equal(actual);
      })
      it('days future', function() {
        const relative = dateNow - 1000 * 60 * 60 * 24 * 10;
        const actual: { duration: intl.DurationFormat, isFuture: boolean } = { 
          duration: {
            days: 10,
          },
          isFuture: true
        };
        const result = intl.relativeToDuration(dateNow, ['days'], relative);
        expect(result).to.deep.equal(actual);
      })
      it('days past', function() {
        const relative = dateNow + 1000 * 60 * 60 * 24 * 10;
        const actual: { duration: intl.DurationFormat, isFuture: boolean } = { 
          duration: {
            days: 10,
          },
          isFuture: false
        };
        const result = intl.relativeToDuration(dateNow, ['days'], relative);
        expect(result).to.deep.equal(actual);
      })
      it('mins hours days years future', function() {
        const relative = dateNow - (1000 * 60 * 10 + 1000 * 60 * 60 * 10 + 1000 * 60 * 60 * 24 * 10 + 1000 * 60 * 60 * 24 * 365 * 10);
        const actual: { duration: intl.DurationFormat, isFuture: boolean } = { 
          duration: { 
            minutes: 10,
            hours: 10,
            days: 10,
            years: 10,
          },
          isFuture: true 
        };
        const result = intl.relativeToDuration(dateNow, ['minutes', 'hours', 'days', 'years'], relative);
        expect(result).to.deep.equal(actual);
      })
      it('mins hours days years past', function() {
        const relative = dateNow + 1000 * 60 * 10 + 1000 * 60 * 60 * 10 + 1000 * 60 * 60 * 24 * 10 + 1000 * 60 * 60 * 24 * 365 * 10;
        const actual: { duration: intl.DurationFormat, isFuture: boolean } = { 
          duration: { 
            minutes: 10,
            hours: 10,
            days: 10,
            years: 10,
          },
          isFuture: false 
        };
        const result = intl.relativeToDuration(dateNow, ['minutes', 'hours', 'days', 'years'], relative);
        expect(result).to.deep.equal(actual);
      })
      it('mins hours days future', function() {
        const relative = dateNow - (1000 * 60 * 10 + 1000 * 60 * 60 * 10 + 1000 * 60 * 60 * 24 * 10);
        const actual: { duration: intl.DurationFormat, isFuture: boolean } = { 
          duration: { 
            minutes: 10,
            hours: 10,
            days: 10,
          },
          isFuture: true 
        };
        const result = intl.relativeToDuration(dateNow, ['minutes', 'hours', 'days'], relative);
        expect(result).to.deep.equal(actual);
      })
      it('mins hours days past', function() {
        const relative = dateNow + 1000 * 60 * 10 + 1000 * 60 * 60 * 10 + 1000 * 60 * 60 * 24 * 10;
        const actual: { duration: intl.DurationFormat, isFuture: boolean } = { 
          duration: { 
            minutes: 10,
            hours: 10,
            days: 10,
          },
          isFuture: false 
        };
        const result = intl.relativeToDuration(dateNow, ['minutes', 'hours', 'days'], relative);
        expect(result).to.deep.equal(actual);
      })
      it('mins hours future', function() {
        const relative = dateNow - 1000 * 60 * 10 - 1000 * 60 * 60 * 10;
        const actual: { duration: intl.DurationFormat, isFuture: boolean } = { 
          duration: { 
            minutes: 10,
            hours: 10,
          },
          isFuture: true 
        };
        const result = intl.relativeToDuration(dateNow, ['minutes', 'hours'], relative);
        expect(result).to.deep.equal(actual);
      })
      it('mins hours past', function() {
        const relative = dateNow + 1000 * 60 * 10 + 1000 * 60 * 60 * 10;
        const actual: { duration: intl.DurationFormat, isFuture: boolean } = { 
          duration: { 
            minutes: 10,
            hours: 10,
          },
          isFuture: false 
        };
        const result = intl.relativeToDuration(dateNow, ['minutes', 'hours'], relative);
        expect(result).to.deep.equal(actual);
      })
      it('mins future', function() {
        const relative = dateNow - 1000 * 60 * 10;
        const actual: { duration: intl.DurationFormat, isFuture: boolean } = { 
          duration: { 
            minutes: 10,
          },
          isFuture: true 
        };
        const result = intl.relativeToDuration(dateNow, ['minutes'], relative);
        expect(result).to.deep.equal(actual);
      })
      it('mins past', function() {
        const relative = dateNow + 1000 * 60 * 10;
        const actual: { duration: intl.DurationFormat, isFuture: boolean } = { 
          duration: { 
            minutes: 10,
          },
          isFuture: false 
        };
        const result = intl.relativeToDuration(dateNow, ['minutes'], relative);
        expect(result).to.deep.equal(actual);
      })
      it('seconds future', function() {
        const relative = dateNow - 1000 * 10;
        const actual: { duration: intl.DurationFormat, isFuture: boolean } = { 
          duration: { 
            seconds: 10,
          },
          isFuture: true 
        };
        const result = intl.relativeToDuration(dateNow, ['seconds'], relative);
        expect(result).to.deep.equal(actual);
      })
      it('seconds past', function() {
        const relative = dateNow + 1000 * 10;
        const actual: { duration: intl.DurationFormat, isFuture: boolean } = { 
          duration: { 
            seconds: 10,
          },
          isFuture: false 
        };
        const result = intl.relativeToDuration(dateNow, ['seconds'], relative);
        expect(result).to.deep.equal(actual);
      })
      it('ms future', function() {
        const relative = dateNow - 10;
        const actual: { duration: intl.DurationFormat, isFuture: boolean } = { 
          duration: { 
            milliseconds: 10,
          },
          isFuture: true 
        };
        const result = intl.relativeToDuration(dateNow, ['milliseconds'], relative);
        expect(result).to.deep.equal(actual);
      })
      it('ms past', function() {
        const relative = dateNow + 10;
        const actual: { duration: intl.DurationFormat, isFuture: boolean } = { 
          duration: { 
            milliseconds: 10,
          },
          isFuture: false 
        };
        const result = intl.relativeToDuration(dateNow, ['milliseconds'], relative);
        expect(result).to.deep.equal(actual);
      })
    });

    describe('Fail cases', function() {
      it('NaN', function() {
        const actual: { duration: intl.DurationFormat, isFuture: boolean } = { 
          duration: { 
            minutes: NaN,
          },
          isFuture: false 
        };
        const result = intl.relativeToDuration(NaN, ['minutes']);
        expect(result).to.deep.equal(actual);
      })
      it('NaN with units', function() {
        const actual: { duration: intl.DurationFormat, isFuture: boolean } = { 
          duration: { 
            minutes: NaN,
            hours: NaN,
            days: NaN,
            years: NaN,
          },
          isFuture: false 
        };
        const result = intl.relativeToDuration(NaN);
        expect(result).to.deep.equal(actual);
      })
    });
  });
  describe('timeToString', function() {
    const times: { input: intl.DurationFormat, result: string }[] = [
      {
        input: {
          years: 2,
          days: 200,
          hours: 20,
          minutes: 50,
          seconds: 50,
        },
        result: '2 ys 200 ds 20 hs 50 ms 50 ss'
      },
      {
        input: {
          years: 1,
          days: 1,
          hours: 1,
          minutes: 1,
          seconds: 1,
        },
        result: '1 y 1 d 1 h 1 m 1 s'
      },
      {
        input: {
          years: 0,
          days: 10,
          hours: 0,
          minutes: 23,
          seconds: 10,
        },
        result: '10 ds 23 ms 10 ss'
      },
      {
        input: {
          years: 1,
          days: 0,
          hours: 2,
          minutes: 0,
          seconds: 17,
        },
        result: '1 y 2 hs 17 ss'
      },
    ];
  
    times.forEach(function(time) {
      it(time.result, function() {
        const res = intl.timeToString(time.input);
        expect(res).equal(time.result);
      });
    });
  });
  describe('isValidDate', function() {
    it('Date', function() {
      const res = intl.isValidDate(new Date());
      expect(res).to.equal(true);
    })
    it('number', function() {
      const res = intl.isValidDate(Date.now());
      expect(res).to.equal(true);
    })
    it('null', function() {
      const res = intl.isValidDate(null);
      expect(res).to.equal(false);
    })
    it('undefined', function() {
      const res = intl.isValidDate(undefined);
      expect(res).to.equal(false);
    })
    it('NaN', function() {
      const res = intl.isValidDate(NaN);
      expect(res).to.equal(false);
    })
    it('string valid', function() {
      const res = intl.isValidDate('2020-01-01');
      expect(res).to.equal(true);
    })
    it('string invalid', function() {
      const res = intl.isValidDate('wow');
      expect(res).to.equal(false);
    })
  });
  describe('checkForNow', function() {
    it('Default true', function() {
      const res = intl.checkForNow(dateNow, dateNow + 1000 * 60);
      expect(res).to.equal(false);
    })
    it('Default false', function() {
      const res = intl.checkForNow(dateNow, dateNow + 1000 * 15);
      expect(res).to.equal(true);
    })
    it('With threshold true', function() {
      const res = intl.checkForNow(dateNow, dateNow + 1000 * 60, { seconds: 5 });
      expect(res).to.equal(false);
    })
    it('With threshold false', function() {
      const res = intl.checkForNow(dateNow, dateNow + 1000, { seconds: 5 });
      expect(res).to.equal(true);
    })
    it('NaN', function() {
      const res = intl.checkForNow(NaN);
      expect(res).to.equal(false);
    })
  });
  describe('IntlDuration', function() {
    describe('with Intl.DurationFormat', function() {
      // @ts-expect-error surely it works
      const oldDurationFormat = Intl.DurationFormat;
      before(function() {
        // @ts-expect-error surely it works
        Intl.DurationFormat = class {
          constructor() {
            return this;
          }
          format(duration: intl.DurationFormat) {
              return intl.timeToString(duration);
          }
        };
      })
      after(function() {
        // @ts-expect-error surely it works
        Intl.DurationFormat = oldDurationFormat;
      })
      
      describe('style Duration', function() {
        it('from duration', function() {
          const res = new intl.IntlDuration().setDuration({ hours: 1, minutes: 12, seconds: 45 }).getRelativeText();
          expect(res).to.equal('1 h 12 ms 45 ss');
        })
        it('from duration formatted', function() {
          const res = new intl.IntlDuration().setDurationFormatted({ seconds: 4365 }).getRelativeText();
          expect(res).to.equal('1 h 12 ms 45 ss');
        })
        it('from relative time', function() {
          const res = new intl.IntlDuration().setRelativeTime(4365, 'seconds').getRelativeText();
          expect(res).to.equal('1 h 12 ms 45 ss');
        })
        it('from timestamp', function() {
          const res = new intl.IntlDuration().setTimestamp(dateNow - 4365 * 1000, 'Duration', dateNow).getRelativeText();
          expect(res).to.equal('1 h 12 ms 45 ss');
        })
      })
      describe('style Progress', function() {
        it('from duration formatted', function() {
          const res = new intl.IntlDuration().setDurationFormatted({ seconds: 4365 }, 'Progress').getRelativeText();
          expect(res).to.equal('1 h 12 ms');
        })
        it('from relative time', function() {
          const res = new intl.IntlDuration().setRelativeTime(4365, 'seconds', 'Progress').getRelativeText();
          expect(res).to.equal('1 h 12 ms');
        })
        it('from timestamp', function() {
          const res = new intl.IntlDuration().setTimestamp(dateNow - 4365 * 1000, 'Progress', dateNow).getRelativeText();
          expect(res).to.equal('1 h 12 ms');
        })
      })
      describe('style M/H/D/Y', function() {
        it('from duration formatted', function() {
          const res = new intl.IntlDuration().setDurationFormatted({ seconds: 4365 }, 'M/H/D/Y').getRelativeText();
          expect(res).to.equal('1 h 12 ms');
        })
        it('from relative time', function() {
          const res = new intl.IntlDuration().setRelativeTime(4365, 'seconds', 'M/H/D/Y').getRelativeText();
          expect(res).to.equal('1 h 12 ms');
        })
        it('from timestamp', function() {
          const res = new intl.IntlDuration().setTimestamp(dateNow - 4365 * 1000, 'M/H/D/Y', dateNow).getRelativeText();
          expect(res).to.equal('1 h 12 ms');
        })
      })
    })
    describe('without Intl.DurationFormat (fallback)', function() {
      // @ts-expect-error surely it works
      const oldDurationFormat = Intl.DurationFormat;
      before(function() {
        // @ts-expect-error surely it works
        Intl.DurationFormat = undefined;
      })
      after(function() {
        // @ts-expect-error surely it works
        Intl.DurationFormat = oldDurationFormat;
      })
      it('from duration', function() {
        const res = new intl.IntlDuration().setDuration({ hours: 1, minutes: 12, seconds: 45 }).getRelativeText();
        expect(res).to.equal('1 h 12 ms 45 ss');
      })
      it('from duration formatted', function() {
        const res = new intl.IntlDuration().setDurationFormatted({ seconds: 4365 }).getRelativeText();
        expect(res).to.equal('1 h 12 ms 45 ss');
      })
      it('from relative time', function() {
        const res = new intl.IntlDuration().setRelativeTime(4365, 'seconds').getRelativeText();
        expect(res).to.equal('1 h 12 ms 45 ss');
      })
      it('from timestamp', function() {
        const res = new intl.IntlDuration().setTimestamp(dateNow - 4365 * 1000, 'Duration', dateNow).getRelativeText();
        expect(res).to.equal('1 h 12 ms 45 ss');
      })
    })
  });
  describe('IntlRange', function() {
    let dateFrom = new Date('01/01/2024 16:45');
    let dateTo = new Date('01/10/2024 18:50');

    describe('dates', function() {
      it('Date', function() {
        const res = new intl.IntlRange(dateFrom, dateTo).getDateTimeRangeText({ dateStyle: 'short' });
        expect(res).to.equal('1/1/24\u{2009}\u{2013}\u{2009}1/10/24');
      })
      it('string', function() {
        const res = new intl.IntlRange('01/01/2024', '01/10/2024').getDateTimeRangeText({ dateStyle: 'short' });
        expect(res).to.equal('1/1/24\u{2009}\u{2013}\u{2009}1/10/24');
      })
      it('number', function() {
        dateFrom.setDate(1);
        const res = new intl.IntlRange(dateFrom.getTime(), dateTo.getTime()).getDateTimeRangeText({ dateStyle: 'short' });
        expect(res).to.equal('1/1/24\u{2009}\u{2013}\u{2009}1/10/24');
        
      })
      describe('invalid date', function() {
        it('invalid both', function() {
          const res = new intl.IntlRange(NaN, NaN).getDateTimeRangeText({ dateStyle: 'short' });
          expect(res).to.equal('? - ?');
        })
        it('invalid 1st date', function() {
          const res = new intl.IntlRange(dateFrom, NaN).getDateTimeRangeText({ dateStyle: 'short' });
          expect(res).to.equal('1/1/24 - ?');
        })
        it('invalid 2nd date', function() {
          const res = new intl.IntlRange(NaN, dateTo).getDateTimeRangeText({ dateStyle: 'short' });
          expect(res).to.equal('? - 1/10/24');
        })
      })
    });
    describe('times', function() {
      dateFrom = new Date('01/01/2024 16:45:15');
      it('Date', function() {
        const res = new intl.IntlRange(dateFrom, new Date('01/01/2024 18:55:55')).getDateTimeRangeText({ timeStyle: 'short' });
        expect(res).to.equal('4:45\u{2009}\u{2013}\u{2009}6:55\u{202F}PM');
      })
      it('number', function() {
        dateFrom.setDate(1);
        const res = new intl.IntlRange(dateFrom.getTime(), dateFrom.getTime() + 1000 * 60 * 60 * 2 + 1000 * 60 * 5 + 1000 * 15).getDateTimeRangeText({ timeStyle: 'short' });
        expect(res).to.equal('4:45\u{2009}\u{2013}\u{2009}6:50\u{202F}PM');
        
      })
      describe('invalid time', function() {
        it('invalid both', function() {
          const res = new intl.IntlRange(NaN, NaN).getDateTimeRangeText({ timeStyle: 'short' });
          expect(res).to.equal('? - ?');
        })
        it('invalid 1st time', function() {
          const res = new intl.IntlRange(dateFrom, NaN).getDateTimeRangeText({ timeStyle: 'short' });
          expect(res).to.equal('4:45 PM - ?');
        })
        it('invalid 2nd time', function() {
          const res = new intl.IntlRange(NaN, dateFrom).getDateTimeRangeText({ timeStyle: 'short' });
          expect(res).to.equal('? - 4:45 PM');
        })
      })
    });
  });
  describe('IntlDateTime', function() {
    let date = new Date('01/01/2024 16:45');
    // @ts-expect-error surely it works
    const oldDurationFormat = Intl.DurationFormat;
    before(function() {
      // @ts-expect-error surely it works
      Intl.DurationFormat = class {
        constructor() {
          return this;
        }
        format(duration: intl.DurationFormat) {
            return intl.timeToString(duration);
        }
      };
    })
    after(function() {
      // @ts-expect-error surely it works
      Intl.DurationFormat = oldDurationFormat;
    })

    describe('getDateTimeText', function() {
      it('from Date', function() {
        const res = new intl.IntlDateTime(date).getDateTimeText({ dateStyle: 'short' });
        expect(res).to.equal('1/1/24');
      })
      it('from string', function() {
        const res = new intl.IntlDateTime('01/01/2024').getDateTimeText({ dateStyle: 'short' });
        expect(res).to.equal('1/1/24');
      })
      it('from number', function() {
        date.setDate(1);
        const res = new intl.IntlDateTime(date.getTime()).getDateTimeText({ dateStyle: 'short' });
        expect(res).to.equal('1/1/24');
      })
      it('from NaN', function() {
        const res = new intl.IntlDateTime(NaN).getDateTimeText({ dateStyle: 'short' });
        expect(res).to.equal('');
      })
    })
    describe('isValidDate', function() {
      it('true', function() {
        const res = new intl.IntlDateTime(date).isValidDate();
        expect(res).to.equal(true);
      })
      it('false', function() {
        const res = new intl.IntlDateTime('wow').isValidDate();
        expect(res).to.equal(false);
      })
    })
    describe('isNow', function() {
      it('true', function() {
        const res = new intl.IntlDateTime(new Date()).isNow();
        expect(res).to.equal(true);
      })
      it('false', function() {
        const res = new intl.IntlDateTime(dateNow + 1000 * 60).isNow();
        expect(res).to.equal(false);
      })
    })
    describe('isFuture', function() {
      it('true', function() {
        const res = new intl.IntlDateTime(dateNow + 1000 * 60).isFuture();
        expect(res).to.equal(true);
      })
      it('false', function() {
        const res = new intl.IntlDateTime(dateNow - 1000 * 60).isFuture();
        expect(res).to.equal(false);
      })
    })
    describe('getRelative', function() {
      let dateTime: intl.IntlDateTime;
      before(function() {
        dateTime = new intl.IntlDateTime(dateNow + 1000 * 60 * 10);
      })
      describe('without "now"', function() {
        it('style Duration', function() {
          const res = dateTime.getRelativeNowText('Duration');
          expect(res).to.equal('10 ms');
        })
        it('style Progress', function() {
          const res = dateTime.getRelativeNowText('Progress');
          expect(res).to.equal('10 ms');
        })
        it('style M/H/D/Y', function() {
          const res = dateTime.getRelativeNowText('M/H/D/Y');
          expect(res).to.equal('10 ms');
        })
      })
      describe('with "now"', function() {
        it('style Duration', function() {
          const res = dateTime.setDate(dateNow + 1000 * 60 * 10).getRelativeNowFriendlyText('Duration');
          expect(res).to.equal('10 ms');
        })
        it('style Duration ago', function() {
          const res = dateTime.setDate(dateNow - 1000 * 60 * 10).getRelativeNowFriendlyText('Duration');
          expect(res).to.equal('10 ms ago');
        })
        it('style Progress', function() {
          const res = dateTime.setDate(dateNow + 1000 * 60 * 10).getRelativeNowFriendlyText('Progress');
          expect(res).to.equal('10 ms');
        })
        it('style Progress ago', function() {
          const res = dateTime.setDate(dateNow - 1000 * 60 * 10).getRelativeNowFriendlyText('Progress');
          expect(res).to.equal('10 ms ago');
        })
        it('style M/H/D/Y', function() {
          const res = dateTime.setDate(dateNow + 1000 * 60 * 10).getRelativeNowFriendlyText('M/H/D/Y');
          expect(res).to.equal('10 ms');
        })
        it('style M/H/D/Y ago', function() {
          const res = dateTime.setDate(dateNow - 1000 * 60 * 10).getRelativeNowFriendlyText('M/H/D/Y');
          expect(res).to.equal('10 ms ago');
        })
        it('now', function() {
          const res = dateTime.setDate(dateNow).getRelativeNowFriendlyText();
          expect(res).to.equal('now');
        })
      })
    })
  });
});
