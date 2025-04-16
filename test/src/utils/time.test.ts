import { expect } from 'chai';
import * as timeM from '../../../src/utils/time';

describe('Time', function() {
  const dateNow = Date.now();
  const date = new Date(dateNow);
  this.beforeAll(function() {
    Date.now = () => dateNow;
  });
  describe('dateFromTimezoneToTimezone', function() {
    it('+3', function() {
      const res = timeM.dateFromTimezoneToTimezone(new Date(Date.UTC(2024, 11, 1, 14, 10)), 'UTC', 'Europe/Moscow');
      expect(res).to.deep.equal(new Date(Date.UTC(2024, 11, 1, 17, 10)));
    })
    it('-3', function() {
      const res = timeM.dateFromTimezoneToTimezone(new Date(Date.UTC(2024, 11, 1, 14, 10)), 'Europe/Moscow', 'UTC');
      expect(res).to.deep.equal(new Date(Date.UTC(2024, 11, 1, 11, 10)));
    })
    it('0', function() {
      const res = timeM.dateFromTimezoneToTimezone(new Date(Date.UTC(2024, 11, 1, 14, 10)), 'UTC', 'UTC');
      expect(res).to.deep.equal(new Date(Date.UTC(2024, 11, 1, 14, 10)));
    })
  });
  describe('getWeektime', function() {
    it('Sunday 2:00', function() {
      const res = timeM.getWeektime('Sunday', '2:00');
      //NOTE - I have no idea why function returns only 2017...
      expect(res).to.deep.equal(new Date(Date.UTC(2017, 0, 1, 2, 0)));
    })
    it('Monday 12:00', function() {
      const res = timeM.getWeektime('Monday', '12:00');
      expect(res).to.deep.equal(new Date(Date.UTC(2017, 0, 2, 12, 0)));
    })
    it('Tuesday 20:00', function() {
      const res = timeM.getWeektime('Tuesday', '20:00');
      expect(res).to.deep.equal(new Date(Date.UTC(2017, 0, 3, 20, 0)));
    })
    it('Wednesday 2:00 AM', function() {
      const res = timeM.getWeektime('Wednesday', '2:00 AM');
      expect(res).to.deep.equal(new Date(Date.UTC(2017, 0, 4, 2, 0)));
    })
    it('Thursday 2:00 PM', function() {
      const res = timeM.getWeektime('Thursday', '2:00 PM');
      expect(res).to.deep.equal(new Date(Date.UTC(2017, 0, 5, 14, 0)));
    })
    it('Friday 12:00 PM', function() {
      const res = timeM.getWeektime('Friday', '12:00 PM');
      expect(res).to.deep.equal(new Date(Date.UTC(2017, 0, 6, 12, 0)));
    })
    it('Saturday 12:00 AM', function() {
      const res = timeM.getWeektime('Saturday', '12:00 AM');
      expect(res).to.deep.equal(new Date(Date.UTC(2017, 0, 7, 0, 0)));
    })
    it('null', function() {
      const res = timeM.getWeektime('wow', '12:00 AM');
      expect(res).to.deep.equal(null);
    })
  });
});