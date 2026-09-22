import { expect } from 'chai';
import {
  applyDefaultAnimeDubLanguage,
  getAnimeDubProgressId,
  getAnimeDubUrlLangParam,
  pickPreferredAnimeStreamUrl,
} from '../../../src/utils/animeDubLanguage';

describe('animeDubLanguage', () => {
  beforeEach(() => {
    global.window = { location: { href: 'https://reanime.to/' } } as Window & typeof globalThis;
    global.api = {
      settings: {
        get(name: string) {
          if (name === 'defaultAnimeDubLanguage') return 'en';
          return undefined;
        },
      },
    } as any;
  });

  it('maps English to the Re:Anime dub query value', () => {
    expect(getAnimeDubUrlLangParam('en')).to.equal('dub');
    expect(getAnimeDubProgressId('en')).to.equal('en/dub');
  });

  it('adds the preferred dub lang param to watch URLs', () => {
    const url = applyDefaultAnimeDubLanguage(
      'https://reanime.to/watch/example-id?ep=2',
    );
    expect(url).to.equal('https://reanime.to/watch/example-id?ep=2&lang=dub');
  });

  it('leaves URLs unchanged when the setting is empty', () => {
    const url = 'https://reanime.to/watch/example-id?ep=2';
    const previousGet = global.api.settings.get;
    global.api.settings.get = () => '';
    expect(applyDefaultAnimeDubLanguage(url)).to.equal(url);
    global.api.settings.get = previousGet;
  });

  it('falls back to the first URL when the preferred dub is missing', () => {
    const urls = [
      'https://reanime.to/watch/example-id?ep=1',
      'https://reanime.to/watch/example-id?ep=1&lang=sub',
    ];
    expect(pickPreferredAnimeStreamUrl(urls)).to.equal(urls[0]);
  });

  it('prefers a URL that matches the configured dub language', () => {
    const urls = [
      'https://reanime.to/watch/example-id?ep=1',
      'https://reanime.to/watch/example-id?ep=1&lang=dub',
    ];
    expect(pickPreferredAnimeStreamUrl(urls)).to.equal(urls[1]);
  });
});
