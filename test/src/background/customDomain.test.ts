import { expect } from 'chai';
import * as Api from '../utils/apiStub';
Api.setGlobals();

const manifest = require('../../../dist/webextension/manifest.json');
import { cleanupCustomDomains } from '../../../src/background/customDomain'

describe('Custom Domain', function() {
  before(function() {
    Api.setGlobals();
    global.chrome = {
      runtime: {
        getManifest: function () {
          return manifest;
        }
      }
    }
  });

  describe('CleanUp', function() {
    before(function () {
      const stub = Api.getStub({
        settings: {
          customDomains: [
            'https://vidstreamz.online/embed/*',
            'https://vidstreamz.online/embed/',
            'https://*.vidstreamz.online/embed',
            'http://vidstreamz.online/embed',
            'https://streamani.net/streaming.php?*',
            'https://streamani.net/load.php?*',
            'https://streamani.net/loadserver.php?*',
            'https://sbembed.com/*',
            'https://sbvideo.net/*',
            'https://streamhd.cc/*',

            'http://127.0.0.1:8096/*',
            'http://localhost:8096/*',
            'https://somedomain.notreal/',
            'asdsadassad',
          ].map(el => {
            return { domain: el, page: 'random' };
          }),
        },
      });
      Api.setStub(stub);
    })
    it('Cleanup', async function() {
      await cleanupCustomDomains();
      //@ts-ignore
      expect(api.settings.get('customDomains')).to.deep.equal(
        [
          'http://127.0.0.1:8096/*',
          'http://localhost:8096/*',
          'https://somedomain.notreal/',
          'asdsadassad',
        ].map(el => {
          return { domain: el, page: 'random' };
        }),
      );
    });
  })

})

