<template>
  <div>
    <Section spacer="half" direction="both">
      <Card>
        <Section v-if="repos.length" class="grid" spacer="half">
          <template v-for="(repo, index) in repos" :key="index">
            <FormButton class="close-item" @click="removeRepo(index)">
              <div class="material-icons">close</div>
            </FormButton>
            <FormText
              v-model="repos[index]"
              :validation="validChibiRepo"
              placeholder="Url"
              class="select-items"
            />
          </template>
        </Section>
        <Section>
          <FormButton @click="addRepo()"><div class="material-icons">add</div></FormButton>
        </Section>
        <div v-if="!verifyEverything">
          <FormButton color="secondary">{{ lang('settings_custom_domains_wrong') }}</FormButton>
        </div>
        <div v-else-if="JSON.stringify(model) !== JSON.stringify(repos)">
          <FormButton color="primary" @click="saveRepos()">{{ lang('Update') }}</FormButton>
        </div>
      </Card>
    </Section>
    <template v-if="repoRequest.loading">
      <Card v-if="repoRequest.loading"><Spinner /></Card>
    </template>
    <template v-else>
      <Section v-for="repo in repoRequest.data" :key="repo.url" spacer="half">
        <Card class="repo-item">
          <div class="repo-item-header">
            <div class="repo-url">{{ repo.url }}</div>
            <div class="repo-pill" :class="'error' in repo ? 'repo-pill-error' : 'repo-pill-ok'">
              <div class="material-icons">
                {{ 'error' in repo ? 'error' : 'check_circle' }}
              </div>
              <span v-if="!('error' in repo)">{{ Object.keys(repo.pages).length }}</span>
            </div>
          </div>
          <div v-if="'error' in repo" class="repo-error">
            {{ repo.error.message || String(repo.error) }}
          </div>
          <div v-else class="repo-pages">
            <span v-for="page in repo.pages" :key="page.name" class="repo-page">
              {{ page.name }}
            </span>
          </div>
        </Card>
      </Section>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import Card from '../card.vue';
import FormText from '../form/form-text.vue';
import FormButton from '../form/form-button.vue';
import Section from '../section.vue';
import { createRequest } from '../../utils/reactive';
import Spinner from '../spinner.vue';
import { ChibiListRepository } from '../../../pages-chibi/loader/ChibiListRepository';

defineProps({
  title: {
    type: String,
    required: true,
  },
});

function validChibiRepo(url: string): boolean {
  if (!url || !url.trim()) return false;

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return false;
    if (parsed.hostname !== 'chibi.malsync.moe') return false;
    return true;
  } catch (e) {
    return false;
  }
}

const model = computed({
  get() {
    return api.settings.get('chibiRepos') as string[];
  },
  set(value) {
    value = value
      .map(el => String(el.trim()))
      .filter(el => el)
      .filter(el => validChibiRepo(el));
    value = Array.from(new Set(value));
    api.settings.set('chibiRepos', value);
  },
});

const repos = ref([...model.value] as string[]);

function addRepo() {
  repos.value.push('');
}

const verifyEverything = computed(() => {
  return repos.value.every(repo => validChibiRepo(repo));
});

const saveRepos = async () => {
  model.value = [...repos.value];
};

const removeRepo = (index: number) => {
  repos.value.splice(index, 1);
};

const repoRequest = createRequest(model, async param => {
  const chibiRepo = ChibiListRepository.getInstance(false);
  await chibiRepo.init();
  return chibiRepo.getData();
});
</script>

<style lang="less" scoped>
@import '../../less/_globals.less';

.grid {
  display: grid;
  grid-template-columns: [col-start] auto [col-end] auto;
  justify-content: start;
  gap: @spacer-half;
  align-items: center;
}

.__breakpoint-popup__({
  .grid {
    grid-template-columns: [col-start] auto [col-end] 1fr;
  }
});

.close-item {
  width: fit-content;
}

.select-items {
  min-width: 200px;
  width: 100%;
}

.repo-item {
  .border-radius-small();
}

.repo-item-header {
  margin-bottom: @spacer-half;
  display: flex;
  align-items: center;
  gap: @spacer-half;
  flex-wrap: wrap;
  justify-content: space-between;
}

.repo-url {
  font-family: monospace;
  font-size: @small-text;
  word-break: break-all;
  flex: 1;
  min-width: 220px;
}

.repo-pill {
  .border-pill();

  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  font-size: @small-text;
  white-space: nowrap;

  .material-icons {
    font-size: @small-text;
  }
}

.repo-pill-ok {
  background: var(--cl-primary);
  color: var(--cl-primary-contrast);
}

.repo-pill-error {
  color: var(--cl-secondary);
}

.repo-error {
  color: var(--cl-secondary);
  font-family: monospace;
  font-size: @small-text;
  word-break: break-word;
}

.repo-pages {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.repo-page {
  .border-radius-small();

  background: var(--cl-foreground);
  padding: 3px 8px;
  font-size: @tiny-text;
  font-family: monospace;
}
</style>
