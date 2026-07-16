import { expect } from 'chai';
import { DonghuaStream } from '../../../../src/pages-chibi/implementations/DonghuaStream/main';

describe('DonghuaStream page implementation', () => {
  it('registers the site metadata and URL pattern', () => {
    expect(DonghuaStream.name).to.equal('DonghuaStream');
    expect(DonghuaStream.domain).to.equal('https://donghuastream.org');
    expect(DonghuaStream.urls.match).to.deep.equal(['*://donghuastream.org/*']);
  });

  it('provides sync, overview, and episode-list handlers', () => {
    expect(DonghuaStream.sync.nextEpUrl).to.be.a('function');
    expect(DonghuaStream.overview).to.not.be.undefined;
    expect(DonghuaStream.list).to.not.be.undefined;
  });
});
