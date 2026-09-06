<template>
  <Section>
    <FormDropdown v-model="provider" :options="providerOptions" placeholder="Provider" />
    <FormText
      v-if="!predefinedUrls.length"
      v-model="url"
      placeholder="Entry URL, e.g. https://myanimelist.net/anime/21/One_Piece"
    />
    <div v-else class="predefined-note">
      Using predefined test URLs: {{ predefinedUrls.join(', ') }}
    </div>
    <FormButton title="Run" :click="run" :disabled="running || (!predefinedUrls.length && !url)" />
  </Section>
  <Section v-if="running">
    <Spinner />
  </Section>
  <Section v-for="group in groups" :key="group.url">
    <Header>{{ group.url }}</Header>
    <div
      v-for="result in group.results"
      :key="result.name"
      class="result"
      :class="{ fail: !result.pass }"
    >
      {{ result.pass ? '✔' : '✘' }} {{ result.name }}
      <div v-if="result.error" class="error">{{ result.error }}</div>
    </div>
  </Section>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import Section from '../components/section.vue';
import Header from '../components/header.vue';
import FormDropdown from '../components/form/form-dropdown.vue';
import FormText from '../components/form/form-text.vue';
import FormButton from '../components/form/form-button.vue';
import Spinner from '../components/spinner.vue';
import { singleClasses } from '../../_provider/singleFactory';
import { providers as providerInfo, SyncTypes } from '../../_provider/helper';
import { runLiveSyncCheck, LiveCheckResult } from '../../_provider/liveSyncCheck';

const predefinedUrlsByProvider: Record<SyncTypes, string[]> = {
  MAL: [
    'https://myanimelist.net/anime/37258/Omae_wa_Mada_Gunma_wo_Shiranai',
    'https://myanimelist.net/manga/104279/Cicada',
  ],
  MALAPI: [
    'https://myanimelist.net/anime/37258/Omae_wa_Mada_Gunma_wo_Shiranai',
    'https://myanimelist.net/manga/104279/Cicada',
  ],
  ANILIST: [
    'https://myanimelist.net/anime/37258/Omae_wa_Mada_Gunma_wo_Shiranai',
    'https://anilist.co/anime/101042/Omae-wa-Mada-Gunma-wo-Shiranai/',
    'https://myanimelist.net/manga/104279/Cicada',
    'https://anilist.co/manga/116849/Cicada/',
  ],
  KITSU: [
    'https://myanimelist.net/anime/37258/Omae_wa_Mada_Gunma_wo_Shiranai',
    'https://kitsu.app/anime/omae-wa-mada-gunma-wo-shiranai',
    'https://myanimelist.net/manga/104279/Cicada',
    'https://kitsu.app/manga/cicada',
  ],
  SIMKL: [
    'https://myanimelist.net/anime/37258/Omae_wa_Mada_Gunma_wo_Shiranai',
    'https://simkl.com/anime/762987/omae-wa-mada-gunma-o-shiranai',
  ],
  SHIKI: [
    'https://myanimelist.net/anime/37258/Omae_wa_Mada_Gunma_wo_Shiranai',
    'https://shikimori.io/animes/37258-omae-wa-mada-gunma-wo-shiranai',
    'https://myanimelist.net/manga/104279/Cicada',
    'https://shikimori.io/mangas/104279-cicada',
  ],
  MANGABAKA: ['https://myanimelist.net/manga/104279/Cicada', 'https://mangabaka.org/65092'],
};

const providerOptions = Object.values(providerInfo).map(p => ({ title: p.title, value: p.value }));

const provider = ref<SyncTypes>('MAL');
const url = ref('');
const running = ref(false);
const groups = ref<{ url: string; results: LiveCheckResult[] }[]>([]);

const predefinedUrls = computed(() => predefinedUrlsByProvider[provider.value]);

async function run() {
  running.value = true;
  groups.value = [];
  const urls = predefinedUrls.value.length ? predefinedUrls.value : [url.value];
  try {
    await urls.reduce(
      (chain, entryUrl) =>
        chain
          .then(() => runLiveSyncCheck(singleClasses[provider.value], entryUrl))
          .catch(e => [
            {
              name: 'Setup (constructing/fetching the entry failed)',
              pass: false,
              error: e.message || String(e),
            },
          ])
          .then(results => {
            groups.value.push({ url: entryUrl, results });
          }),
      Promise.resolve(),
    );
  } finally {
    running.value = false;
  }
}
</script>

<style lang="less" scoped>
@import '../less/_globals.less';

.predefined-note {
  opacity: 0.8;
}

.result {
  padding: 4px 0;

  &.fail {
    color: var(--cl-red, #d9534f);
  }

  .error {
    opacity: 0.8;
    font-size: 0.9em;
  }
}
</style>
