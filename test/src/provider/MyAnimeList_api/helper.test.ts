import { describe, expect, test, beforeEach, afterEach } from 'vitest';
import { getMalDisplayTitle } from '../../../../src/_provider/MyAnimeList_api/helper';

describe('MyAnimeList_api helper getMalDisplayTitle', () => {
  const node = {
    title: 'Shingeki no Kyojin',
    alternative_titles: { en: 'Attack on Titan' },
  };

  beforeEach(() => {
    api.settings.set('forceEnglishTitles', false);
  });

  afterEach(() => {
    api.settings.set('forceEnglishTitles', false);
  });

  test('returns default title when force English is off', () => {
    expect(getMalDisplayTitle(node)).toBe('Shingeki no Kyojin');
  });

  test('returns English title when force English is on', () => {
    api.settings.set('forceEnglishTitles', true);
    expect(getMalDisplayTitle(node)).toBe('Attack on Titan');
  });

  test('falls back to default title when English is missing', () => {
    api.settings.set('forceEnglishTitles', true);
    expect(getMalDisplayTitle({ title: 'Monster' })).toBe('Monster');
  });
});
