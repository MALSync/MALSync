const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');

function compile(file, dependencies, globals = {}) {
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(source, { exports, require: name => dependencies[name], URL, ...globals });
  return exports;
}

const slugs = compile('src/utils/slugs.ts', {});
const pages = JSON.parse(fs.readFileSync('src/utils/quicklinks.json', 'utf8'));
let saved = {};
const api = {
  settings: { get: () => ['AnimesFHD'], getStaticChibi: () => ({}) },
  request: { xhr: async () => ({ status: 200, responseText: '{"Sites":{}}' }) },
  storage: { list: async type => type === 'local' ? saved : {} },
};
const builder = compile('src/utils/quicklinksBuilder.ts', {
  './slugs': slugs, './quicklinks.json': pages,
}, { api, con: { log() {}, m: () => ({ error() {} }) } });

(async () => {
  const title = 'Nijuuseiki Denki Mokuroku: Eureka Evrika';
  let [button] = await builder.activeLinks('anime', 123, title);
  assert.equal(button.group, 'search');
  assert.equal(new URL(button.links[0].url).searchParams.get('q'), title.toLowerCase());
  assert.notEqual(button.links[0].url, 'https://animesfhd.net');

  [button] = await builder.activeLinks('anime', 123, title, 'https://animesfhd.net/series?id=3323');
  assert.equal(button.group, 'link');
  assert.equal(button.links[0].url, 'https://animesfhd.net/serie/3323');

  saved = { 'AnimesFHD/3323/Search': { url: 'https://myanimelist.net/anime/123/Test' } };
  [button] = await builder.activeLinks('anime', 123, title);
  assert.equal(button.links[0].url, 'https://animesfhd.net/serie/3323');
  [button] = await builder.activeLinks('anime', 456, title, 'https://evil.test/serie/3323');
  assert.equal(button.group, 'search');

  saved['AnimesFHD/4000/Search'] = { url: 'https://myanimelist.net/anime/123/Test' };
  [button] = await builder.activeLinks('anime', 123, title);
  assert.equal(button.group, 'search');
  saved = { 'AnimesFHD/3323/Search': { url: 'https://anilist.co/anime/567/Test' } };
  [button] = await builder.activeLinks('anime', 'a:567', title);
  assert.equal(button.links[0].url, 'https://animesfhd.net/serie/3323');
  console.log('Streaming button: linked series, local MAL/AniList associations, title search, unsafe URL and ambiguous editions passed');
})().catch(error => { console.error(error); process.exitCode = 1; });
