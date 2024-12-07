import { expect } from 'chai';
import * as timeM from '../../../src/utils/time';

describe('Time', function() {
  const dateNow = Date.now();
  before(function() {
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
            "bookmarksItem_now": "n",
          };
          return val[key];
        }
      }
    }
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
  describe('timeToString', function() {
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
  });
  describe('timestampToTime', function() {
    it('+1s', function() {
      const res = timeM.timestampToTime(dateNow + 1000);
      expect(res).to.deep.equal({
        time: {
          years: 0,
          months: 0,
          weeks: 0,
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 1
        },
        isFuture: true
      });
    })
    it('-1s', function() {
      const res = timeM.timestampToTime(dateNow - 1000);
      expect(res).to.deep.equal({
        time: {
          years: 0,
          months: 0,
          weeks: 0,
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 1
        },
        isFuture: false
      });
    })
    it('+2d', function() {
      const res = timeM.timestampToTime(dateNow + (2 * 24 * 60 * 60 * 1000));
      expect(res).to.deep.equal({
        time: {
          years: 0,
          months: 0,
          weeks: 0,
          days: 2,
          hours: 0,
          minutes: 0,
          seconds: 0
        },
        isFuture: true
      });
    })
    it('-2d', function() {
      const res = timeM.timestampToTime(dateNow - (2 * 24 * 60 * 60 * 1000));
      expect(res).to.deep.equal({
        time: {
          years: 0,
          months: 0,
          weeks: 0,
          days: 2,
          hours: 0,
          minutes: 0,
          seconds: 0
        },
        isFuture: false
      });
    })
    it('+1y', function() {
      const res = timeM.timestampToTime(dateNow + (365 * 24 * 60 * 60 * 1000));
      expect(res).to.deep.equal({
        time: {
          years: 1,
          months: 0,
          weeks: 0,
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0
        },
        isFuture: true
      });
    })
    it('-1y', function() {
      const res = timeM.timestampToTime(dateNow - (365 * 24 * 60 * 60 * 1000));
      expect(res).to.deep.equal({
        time: {
          years: 1,
          months: 0,
          weeks: 0,
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0
        },
        isFuture: false
      });
    })
  });
  describe('getDurationInLocale', function() {
    describe('with Intl.DurationFormat', function() {
      // @ts-expect-error surely it works
      const oldDurationFormat = Intl.DurationFormat;
      before(function() {
        // @ts-expect-error surely it works
        Intl.DurationFormat = class {
          constructor() {
            return;
          }
          format() {
              return '1h 12m 45s';
          }
        };
      })
      after(function() {
        // @ts-expect-error surely it works
        Intl.DurationFormat = oldDurationFormat;
      })
      it('Intl.DurationFormat available', function() {
        const res = timeM.getDurationInLocale({
          hours: 1,
          minutes: 12,
          seconds: 45
        });
        expect(res).to.equal('1h 12m 45s');
      })
    });
    
    describe('without Intl.DurationFormat', function() {
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
      it('Intl.DurationFormat NOT available', function() {
        const res = timeM.getDurationInLocale({
          hours: 1,
          minutes: 12,
          seconds: 45
        });
        expect(res).to.equal('1 h 12 ms 45 ss');
      })
    });
  });
  describe('minsSecsToHoursMins', function() {
    describe('minutes only', function() {
      it('< 60', function() {
        const res = timeM.minsSecsToHoursMins(50, 0);
        expect(res).to.deep.equal({hours: 0, minutes: 50});
      })
      it('> 60', function() {
        const res = timeM.minsSecsToHoursMins(80, 0);
        expect(res).to.deep.equal({hours: 1, minutes: 20});
      })
      it('= 0', function() {
        const res = timeM.minsSecsToHoursMins(0, 0);
        expect(res).to.deep.equal({hours: 0, minutes: 0});
      })
    })
    
    describe('seconds only', function() {
      it('< 60', function() {
        const res = timeM.minsSecsToHoursMins(0, 50);
        expect(res).to.deep.equal({hours: 0, minutes: 0});
      })
      it('> 60', function() {
        const res = timeM.minsSecsToHoursMins(0, 300);
        expect(res).to.deep.equal({hours: 0, minutes: 5});
      })
      it('= 0', function() {
        const res = timeM.minsSecsToHoursMins(0, 0);
        expect(res).to.deep.equal({hours: 0, minutes: 0});
      })
    })
    
    describe('minutes + seconds', function() {
      it('m < 60 s < 60', function() {
        const res = timeM.minsSecsToHoursMins(50, 50);
        expect(res).to.deep.equal({hours: 0, minutes: 50});
      })
      it('m < 60 s > 60', function() {
        const res = timeM.minsSecsToHoursMins(50, 300);
        expect(res).to.deep.equal({hours: 0, minutes: 55});
      })
      it('m > 60 s < 60', function() {
        const res = timeM.minsSecsToHoursMins(80, 50);
        expect(res).to.deep.equal({hours: 1, minutes: 20});
      })
      it('m > 60 s > 60', function() {
        const res = timeM.minsSecsToHoursMins(80, 300);
        expect(res).to.deep.equal({hours: 1, minutes: 25});
      })
      it('m = 0 s = 0', function() {
        const res = timeM.minsSecsToHoursMins(0, 0);
        expect(res).to.deep.equal({hours: 0, minutes: 0});
      })
    })
    
  });
  describe('isValidDate', function() {
    it('Date', function() {
      const res = timeM.isValidDate(new Date());
      expect(res).to.equal(true);
    })
    it('number', function() {
      const res = timeM.isValidDate(Date.now());
      expect(res).to.equal(true);
    })
    it('null', function() {
      const res = timeM.isValidDate(null);
      expect(res).to.equal(false);
    })
    it('undefined', function() {
      const res = timeM.isValidDate(undefined);
      expect(res).to.equal(false);
    })
    it('NaN', function() {
      const res = timeM.isValidDate(NaN);
      expect(res).to.equal(false);
    })
  });
  describe('getProgressDateTimeInLocale', function() {
    it('null timestamp', function() {
      const res = timeM.getProgressDateTimeInLocale(null);
      expect(res).to.equal('');
    })
    it('now', function() {
      const res = timeM.getProgressDateTimeInLocale(dateNow + 1000 * 20);
      expect(res).to.equal('now');
    })
    describe('with Intl.DurationFormat', function() {
      // @ts-expect-error surely it works
      const oldDurationFormat = Intl.DurationFormat;
      before(function() {
        // @ts-expect-error surely it works
        Intl.DurationFormat = class {
          constructor() {
            return;
          }
          format() {
              return '1h 12m 45s';
          }
        };
      })
      after(function() {
        // @ts-expect-error surely it works
        Intl.DurationFormat = oldDurationFormat;
      })
      it('future', function() {
        const res = timeM.getProgressDateTimeInLocale(dateNow + 1000 * 45 + 1000 * 60 * 12 + 1000 * 60 * 60);
        expect(res).to.equal('1h 12m 45s');
      })
      it('past', function() {
        const res = timeM.getProgressDateTimeInLocale(dateNow - + 1000 * 45 - 1000 * 60 * 12 - 1000 * 60 * 60);
        expect(res).to.equal('1h 12m 45s ago');
      })
    });
    
    describe('without Intl.DurationFormat', function() {
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
      it('future', function() {
        const res = timeM.getProgressDateTimeInLocale(dateNow + 1000 * 45 + 1000 * 60 * 12 + 1000 * 60 * 60);
        expect(res).to.equal('1 h 12 ms');
      })
      it('past', function() {
        const res = timeM.getProgressDateTimeInLocale(dateNow - + 1000 * 45 - 1000 * 60 * 12 - 1000 * 60 * 60);
        expect(res).to.equal('1 h 12 ms ago');
      })
    });
  });
  describe('getDateTimeRangeInLocale', function() {
    let dateFrom = new Date('01/01/2024 16:45');
    let dateTo = new Date('01/10/2024 18:50');
    describe('with Intl.DateTimeFormat', function() {
      const oldDateTimeFormat = Intl.DateTimeFormat;
      before(function() {
        // @ts-expect-error surely it works
        Intl.DateTimeFormat = class {
          style: any;
          locale: any;
          constructor(locale, style) {
            this.locale = locale;
            this.style = style;
          }
          formatRange(from, to) {
            return `${new Date(from).toLocaleString(this.locale, this.style)} - ${new Date(to).toLocaleString(this.locale, this.style)}`;
          }
          format(date) {
            return `${new Date(date).toLocaleString(this.locale, this.style)}`;
          }
        }
      })
      after(function() {
        Intl.DateTimeFormat = oldDateTimeFormat;
      })
      describe('getDateRangeInLocale', function() {
        it('Date', function() {
          const res = timeM.getDateRangeInLocale(dateFrom, dateTo, undefined, 'short');
          expect(res).to.equal('1/1/24 - 1/10/24');
        })
        it('string', function() {
          const res = timeM.getDateRangeInLocale('01/01/2024', '01/10/2024', undefined, 'short');
          expect(res).to.equal('1/1/24 - 1/10/24');
        })
        it('number', function() {
          dateFrom.setDate(1);
          const res = timeM.getDateRangeInLocale(dateFrom.getTime(), dateTo.getTime(), undefined, 'short');
          expect(res).to.equal('1/1/24 - 1/10/24');
          
        })
        describe('invalid date', function() {
          it('invalid both', function() {
            const res = timeM.getDateRangeInLocale(null, null, undefined, 'short');
            expect(res).to.equal('? - ?');
          })
          it('invalid 1st date', function() {
            const res = timeM.getDateRangeInLocale(dateFrom, null, undefined, 'short');
            expect(res).to.equal('1/1/24 - ?');
          })
          it('invalid 2nd date', function() {
            const res = timeM.getDateRangeInLocale(null, dateTo, undefined, 'short');
            expect(res).to.equal('? - 1/10/24');
          })
        })
      });
      describe('getTimeRangeInLocale', function() {
        dateFrom = new Date('01/01/2024 16:45:15');
        it('Date', function() {
          const res = timeM.getTimeRangeInLocale(dateFrom, new Date('01/01/2024 18:55:55'), undefined, 'short');
          expect(res).to.equal('4:45 PM - 6:55 PM');
        })
        it('number', function() {
          dateFrom.setDate(1);
          const res = timeM.getTimeRangeInLocale(dateFrom.getTime(), dateFrom.getTime() + 1000 * 60 * 60 * 2 + 1000 * 60 * 5 + 1000 * 15, undefined, 'short');
          expect(res).to.equal('4:45 PM - 6:50 PM');
          
        })
        describe('invalid time', function() {
          it('invalid both', function() {
            const res = timeM.getTimeRangeInLocale(null, null, undefined, 'short');
            expect(res).to.equal('? - ?');
          })
          it('invalid 1st time', function() {
            const res = timeM.getTimeRangeInLocale(dateFrom, null, undefined, 'short');
            expect(res).to.equal('4:45 PM - ?');
          })
          it('invalid 2nd time', function() {
            const res = timeM.getTimeRangeInLocale(null, dateFrom, undefined, 'short');
            expect(res).to.equal('? - 4:45 PM');
          })
        })
      });
    });
    describe('without Intl.DateTimeFormat', function() {
      const oldDateTimeFormat = Intl.DateTimeFormat;
      before(function() {
        // @ts-expect-error surely it works
        Intl.DateTimeFormat = undefined
      })
      after(function() {
        Intl.DateTimeFormat = oldDateTimeFormat;
      })
      describe('getDateRangeInLocale', function() {
        it('Date', function() {
          const res = timeM.getDateRangeInLocale(dateFrom, dateTo, undefined, 'short');
          expect(res).to.equal(`1/1/24 - 1/10/24`);
        })
        it('string', function() {
          const res = timeM.getDateRangeInLocale('01/01/2024', '01/10/2024', undefined, 'short');
          expect(res).to.equal(`1/1/24 - 1/10/24`);
        });

        it('number', function() {
          dateFrom.setDate(1);
          const res = timeM.getDateRangeInLocale(dateFrom.getTime(), dateTo.getTime(), undefined, 'short');
          expect(res).to.equal('1/1/24 - 1/10/24');
          
        })
        describe('invalid date', function() {
          it('invalid both', function() {
            const res = timeM.getDateRangeInLocale(null, null, undefined, 'short');
            expect(res).to.equal('? - ?');
          })
          it('invalid 1st date', function() {
            const res = timeM.getDateRangeInLocale(dateFrom, null, undefined, 'short');
            expect(res).to.equal('1/1/24 - ?');
          })
          it('invalid 2nd date', function() {
            const res = timeM.getDateRangeInLocale(null, dateTo, undefined, 'short');
            expect(res).to.equal('? - 1/10/24');
          })
        })
      });
      describe('getTimeRangeInLocale', function() {
        dateFrom = new Date('01/01/2024 16:45:15');
        it('Date', function() {
          const res = timeM.getTimeRangeInLocale(dateFrom, dateTo, undefined, 'short');
          expect(res).to.equal('4:45 PM - 6:50 PM');
        })
        it('number', function() {
          dateFrom.setDate(1);
          const res = timeM.getTimeRangeInLocale(dateFrom.getTime(), dateTo.getTime(), undefined, 'short');
          expect(res).to.equal('4:45 PM - 6:50 PM');
          
        })
        describe('invalid time', function() {
          it('invalid both', function() {
            const res = timeM.getTimeRangeInLocale(null, null, undefined, 'short');
            expect(res).to.equal('? - ?');
          })
          it('invalid 1st time', function() {
            const res = timeM.getTimeRangeInLocale(dateFrom, null, undefined, 'short');
            expect(res).to.equal('4:45 PM - ?');
          })
          it('invalid 2nd time', function() {
            const res = timeM.getTimeRangeInLocale(null, dateTo, undefined, 'short');
            expect(res).to.equal('? - 6:50 PM');
          })
        })
      });
    });
  });
  describe('getDateTimeInLocale', function() {
    let date = new Date('01/01/2024 16:45');
    describe('with Intl.DateTimeFormat', function() {
      const oldDateTimeFormat = Intl.DateTimeFormat;
      before(function() {
        // @ts-expect-error surely it works
        Intl.DateTimeFormat = class {
          style: any;
          locale: any;
          constructor(locale, style) {
            this.locale = locale;
            this.style = style;
          }
          format(date) {
            return `${new Date(date).toLocaleString(this.locale, this.style)}`;
          }
        }
      })
      after(function() {
        Intl.DateTimeFormat = oldDateTimeFormat;
      })
      describe('getDateInLocale', function() {
        it('Date', function() {
          const res = timeM.getDateInLocale(date, undefined, 'short');
          expect(res).to.equal('1/1/24');
        })
        it('string', function() {
          const res = timeM.getDateInLocale('01/01/2024', undefined, 'short');
          expect(res).to.equal('1/1/24');
        })
        it('number', function() {
          date.setDate(1);
          const res = timeM.getDateInLocale(date.getTime(), undefined, 'short');
          expect(res).to.equal('1/1/24');
          
        })
        it('invalid', function() {
          const res = timeM.getDateInLocale(null, undefined, 'short');
          expect(res).to.equal('?');
        })
      });
      describe('getTimeInLocale', function() {
        it('Date', function() {
          const res = timeM.getTimeInLocale(date, undefined, 'short');
          expect(res).to.equal('4:45 PM');
        })
        it('number', function() {
          date.setDate(1);
          const res = timeM.getTimeInLocale(date.getTime(), undefined, 'short');
          expect(res).to.equal('4:45 PM');
          
        })
        it('invalid', function() {
          const res = timeM.getTimeInLocale(null, undefined, 'short');
          expect(res).to.equal('?');
        })
      });
    });
    describe('without Intl.DateTimeFormat', function() {
      const oldDateTimeFormat = Intl.DateTimeFormat;
      before(function() {
        // @ts-expect-error surely it works
        Intl.DateTimeFormat = undefined
      })
      after(function() {
        Intl.DateTimeFormat = oldDateTimeFormat;
      })
      describe('getDateInLocale', function() {
        it('Date', function() {
          const res = timeM.getDateInLocale(date, undefined, 'short');
          expect(res).to.equal(`1/1/24`);
        })
        it('string', function() {
          const res = timeM.getDateInLocale('01/01/2024', undefined, 'short');
          expect(res).to.equal(`1/1/24`);
        });

        it('number', function() {
          const res = timeM.getDateInLocale(date.getTime(), undefined, 'short');
          expect(res).to.equal('1/1/24');
          
        })
        it('invalid', function() {
          const res = timeM.getDateInLocale(null, undefined, 'short');
          expect(res).to.equal('?');
        })
      })
    });
    describe('getTimeInLocale', function() {
      it('Date', function() {
        const res = timeM.getTimeInLocale(date, undefined, 'short');
        expect(res).to.equal('4:45 PM');
      })
      it('number', function() {
        const res = timeM.getTimeInLocale(date.getTime(), undefined, 'short');
        expect(res).to.equal('4:45 PM');
        
      })
      it('invalid', function() {
        const res = timeM.getTimeInLocale(null, undefined, 'short');
        expect(res).to.equal('?');
      })
    });
  });
});