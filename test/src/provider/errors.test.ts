import { expect } from 'chai';
import { parseJson, UnexpectedResponseError } from '../../../src/_provider/Errors';

describe('parseJson', function () {
  this.beforeAll(function () {
    // @ts-ignore
    global.con = { error: () => {} };
  });

  it('parses json', function () {
    expect(parseJson('{"a":1}')).to.deep.equal({ a: 1 });
  });

  it('uses the html title', function () {
    expect(() => parseJson('<html><head><title> You are banned </title></head></html>'))
      .to.throw(UnexpectedResponseError)
      .with.property('message', 'You are banned');
  });

  it('falls back to the body', function () {
    expect(() => parseJson('nope\n  not json'))
      .to.throw(UnexpectedResponseError)
      .with.property('message', 'nope not json');
  });

  it('handles empty responses', function () {
    expect(() => parseJson('')).to.throw('Empty response');
  });
});
