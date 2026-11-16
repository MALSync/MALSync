const mode = process.env.CI_MODE || 'default';

module.exports = {
  getKeys() {
    let simklId = '90d0be129d5988174e02a05391b5a1315be10f392c64756cbae472ee015a82e4';
    let simklSecret = '1e0282776749b0be38c198db748df3e2172c48affc94f2ef15b940f009bf39c2';

    let mangabakaId = 'gkakHAvTRJdSNROnJVeCborCYCqveNSx';
    let mangabakaSecret = 'aSJdQANfWahFBPpqkVqYDYaFzvYjRUJv';

    let animeoshiId = 'malsync';
    let animeoshiApiKey = '856a7ee8b016eb9b6cb8a5991f9e3b26b4f779a47d8ab4ce61855084b7a9c9f8';

    if (mode === 'travis') {
      const required = [
        'SIMKL_API_ID',
        'SIMKL_API_SECRET',
        'MANGABAKA_API_ID',
        'MANGABAKA_API_SECRET',
        'ANIMEOSHI_API_ID',
        'ANIMEOSHI_API_KEY',
      ];
      const missing = required.filter(key => !process.env[key]);
      if (missing.length) {
        throw new Error(`${missing.join(', ')} are not set`);
      }

      simklId = process.env.SIMKL_API_ID;
      simklSecret = process.env.SIMKL_API_SECRET;
      mangabakaId = process.env.MANGABAKA_API_ID;
      mangabakaSecret = process.env.MANGABAKA_API_SECRET;
      animeoshiId = process.env.ANIMEOSHI_API_ID;
      animeoshiApiKey = process.env.ANIMEOSHI_API_KEY;
    }

    return {
      simkl: {
        id: simklId,
        secret: simklSecret,
      },
      mangabaka: {
        id: mangabakaId,
        secret: mangabakaSecret,
      },
      animeoshi: {
        id: animeoshiId,
        apiKey: animeoshiApiKey,
      },
    }
  }
};
