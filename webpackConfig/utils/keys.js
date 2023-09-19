const mode = process.env.CI_MODE || 'default';

module.exports = {
  getKeys() {
    let simklId = '90d0be129d5988174e02a05391b5a1315be10f392c64756cbae472ee015a82e4';
    let simklSecret = '1e0282776749b0be38c198db748df3e2172c48affc94f2ef15b940f009bf39c2';

    if (mode === 'travis') {
      if (!process.env.SIMKL_API_ID || !process.env.SIMKL_API_SECRET) {
        throw new Error('SIMKL_API_ID and SIMKL_API_SECRET are not set');
      }

      simklId = process.env.SIMKL_API_ID;
      simklSecret = process.env.SIMKL_API_SECRET;
    }

    return {
      simkl: {
        id: simklId,
        secret: simklSecret,
      },
    }
  }
};
