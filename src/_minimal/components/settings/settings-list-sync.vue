<template>
  <div class="list-sync">
    <SettingsGeneral
      v-if="isExtension()"
      component="checkbox"
      :title="lang('settings_listsync_background')"
    >
      <template #component> <FormCheckbox v-model="backgroundSync" /> </template>
    </SettingsGeneral>
    <Section spacer="half" direction="both">
      <Card>
        <div>
          <MediaLink color="secondary" href="https://github.com/MALSync/MALSync/wiki/List-Sync">
            {{ lang('settings_more_info') }}
          </MediaLink>
        </div>
      </Card>
    </Section>
    <Card class="list-sync">
      <Section>
        <FormSwitch
          v-model="parameters.type"
          :options="[
            {
              value: 'anime',
              title: lang('Anime'),
            },
            {
              value: 'manga',
              title: lang('Manga'),
            },
          ]"
        />
      </Section>
      <div class="provider-section">
        <div
          v-for="provider in Object.values(providerList) as any[]"
          :key="provider.providerType"
          class="provider-item"
        >
          <FormButton v-if="provider.providerSettings.master" :animation="false" color="secondary">
            Master
          </FormButton>
          <FormButton :animation="false" class="provider-item-content">
            <div>
              {{ provider.providerType }}
            </div>
            <div v-dompurify-html="provider.providerSettings.text" />
            <div>
              List:
              {{ provider.providerSettings.list ? provider.providerSettings.list.length : '??' }}
            </div>
          </FormButton>
        </div>
      </div>
    </Card>

    <Card v-if="syncRequest.loading" class="spinner-wrap"><Spinner /></Card>

    <Section v-if="!syncRequest.loading && syncRequest.data">
      <Card>
        <Section v-if="!syncing" spacer="half">
          Items to sync:
          <CodeBlock>
            <strong>{{ itemNumber }}</strong>
          </CodeBlock>
        </Section>

        <Section v-else spacer="half">
          Syncing please wait:
          <CodeBlock>
            <strong>{{ totalItems - itemNumber }} / {{ totalItems }}</strong>
          </CodeBlock>
        </Section>

        <FormButton
          v-if="!syncRequest.loading && syncRequest.data"
          color="primary"
          :disabled="syncing"
          @click="!syncing ? startSync() : ''"
        >
          Sync
        </FormButton>
      </Card>
    </Section>

    <Section v-if="!syncRequest.loading && listDiff">
      <Header spacer="half">Updates</Header>
      <Description :height="500">
        <Section v-for="(item, index) in listDiff" :key="index" spacer="half">
          <Card class="listDiff">
            <Header spacer="half">
              {{ item.master.title }}
            </Header>
            <div class="listDiff-inner">
              <FormButton :animation="false">
                {{ index }}
              </FormButton>
              <FormButton
                v-if="item.master && item.master.uid"
                :animation="false"
                color="secondary"
                class="master"
              >
                <div>{{ sync.getType(item.master.url) }}</div>
                <div>
                  ID: <MediaLink :href="item.master.url">{{ item.master.uid }}</MediaLink>
                </div>
                <div>
                  {{ item.master.type === 'anime' ? 'Ep' : 'Ch' }}: {{ item.master.watchedEp }}
                </div>
                <div v-if="item.master.type === 'manga'">Vol: {{ item.master.readVol }}</div>
                <div>Status: {{ getStatusText(item.master.type, item.master.status) }}</div>
                <div>Start Date: {{ item.master.startDate ?? 'not set' }}</div>
                <div>Finish Date: {{ item.master.finishDate ?? 'not set' }}</div>
                <div>Score: {{ item.master.score }}</div>
              </FormButton>
              <FormButton
                v-for="slave in item.slaves"
                :key="slave.uid"
                :animation="false"
                class="slave"
              >
                <div>{{ sync.getType(slave.url) }}</div>
                <div>
                  ID: <MediaLink :href="slave.url">{{ slave.uid }}</MediaLink>
                </div>
                <div>
                  {{ slave.type === 'anime' ? 'Ep' : 'Ch' }}: {{ slave.watchedEp }}
                  <span v-if="slave.diff && slave.diff.watchedEp">
                    → <text class="highlight">{{ slave.diff.watchedEp }}</text>
                  </span>
                </div>
                <div v-if="slave.type === 'manga'">
                  Vol: {{ slave.readVol }}
                  <span v-if="slave.diff && slave.diff.readVol">
                    → <text class="highlight">{{ slave.diff.readVol }}</text>
                  </span>
                </div>
                <div>
                  Status: {{ getStatusText(slave.type, slave.status) }}
                  <span v-if="slave.diff && slave.diff.status">
                    →
                    <text class="highlight">{{
                      getStatusText(slave.type, slave.diff.status)
                    }}</text>
                  </span>
                </div>
                <div>
                  Start Date: {{ slave.startDate ?? 'not set' }}
                  <span v-if="slave.diff && slave.diff.startDate !== undefined">
                    → <text class="highlight">{{ slave.diff.startDate ?? 'not set' }}</text>
                  </span>
                </div>
                <div>
                  Finish Date: {{ slave.finishDate ?? 'not set' }}
                  <span v-if="slave.diff && slave.diff.finishDate !== undefined">
                    → <text class="highlight">{{ slave.diff.finishDate ?? 'not set' }}</text>
                  </span>
                </div>
                <div>
                  Score: {{ slave.score }}
                  <span v-if="slave.diff && slave.diff.score">
                    → <text class="highlight">{{ slave.diff.score }}</text>
                  </span>
                </div>
              </FormButton>
            </div>
          </Card>
        </Section>
      </Description>
    </Section>

    <Section v-if="!syncRequest.loading && syncRequest.data && syncRequest.data.missing.length">
      <Header spacer="half">Missing</Header>
      <Description :height="500">
        <Section v-for="(item, index) in syncRequest.data.missing" :key="index" spacer="half">
          <Card class="missing">
            <Header spacer="half">
              {{ item.title }}
            </Header>
            <FormButton :animation="false">
              <div>{{ item.syncType }}</div>
              <div>
                ID: <MediaLink :href="item.url">{{ item.malId }}</MediaLink>
              </div>
              <div>{{ item.type === 'anime' ? 'Ep' : 'Ch' }}: {{ item.watchedEp }}</div>
              <div v-if="item.type === 'manga'">Vol: {{ item.readVol }}</div>
              <div>Status: {{ getStatusText(item.type, item.status) }}</div>
              <div>Start Date: {{ item.startDate ?? 'not set' }}</div>
              <div>Finish Date: {{ item.finishDate ?? 'not set' }}</div>
              <div>Score: {{ item.score }}</div>
              <FormButton v-if="item.error" :animation="false" color="secondary" padding="mini">
                {{ item.error }}
              </FormButton>
            </FormButton>
          </Card>
        </Section>
      </Description>
    </Section>
  </div>
</template>

<script lang="ts" setup>
import { computed, reactive, ref } from 'vue';
import * as sync from '../../../utils/syncHandler';
import { getStatusText } from '../../../utils/general';
import { createRequest } from '../../utils/reactive';
import Card from '../card.vue';
import FormSwitch from '../form/form-switch.vue';
import FormButton from '../form/form-button.vue';
import Section from '../section.vue';
import Spinner from '../spinner.vue';
import Header from '../header.vue';
import MediaLink from '../media-link.vue';
import Description from '../description.vue';
import CodeBlock from '../code-block.vue';
import SettingsGeneral from './settings-general.vue';
import FormCheckbox from '../form/form-checkbox.vue';

defineProps({
  title: {
    type: String,
    required: true,
  },
});

const mode = 'mirror';

const providerList = ref(null as any);
const syncing = ref(false);
const totalItems = ref(0);

const parameters = ref({
  type: 'anime',
});

const syncRequest = createRequest(parameters, async params => {
  syncing.value = false;
  totalItems.value = 0;
  const listProvider = reactive({
    mal: {
      text: 'Init',
      list: null,
      master: false,
    },
    anilist: {
      text: 'Init',
      list: null,
      master: false,
    },
    kitsu: {
      text: 'Init',
      list: null,
      master: false,
    },
    simkl: {
      text: 'Init',
      list: null,
      master: false,
    },
  });

  providerList.value = sync.getListProvider({
    mal: listProvider.mal,
    anilist: listProvider.anilist,
    kitsu: listProvider.kitsu,
    simkl: listProvider.simkl,
  });

  const listOptions = await sync.retriveLists(providerList.value, params.value.type, sync.getList);

  const list = [] as any[];
  const missing = [] as any[];

  sync.generateSync(
    listOptions.master as any,
    listOptions.slaves,
    mode,
    listOptions.typeArray,
    list,
    missing,
  );

  return {
    list,
    missing,
  };
});

const listDiff = computed(() => {
  const res = {} as any;
  if (syncRequest.loading || !syncRequest.data) {
    return res;
  }
  for (const key in syncRequest.data.list) {
    if (
      Object.prototype.hasOwnProperty.call(syncRequest.data.list, key) &&
      syncRequest.data.list[key].diff
    ) {
      res[key] = syncRequest.data.list[key];
    }
  }
  return res;
});

const itemNumber = computed(() => {
  if (!listDiff.value || !syncRequest.data) {
    return 0;
  }
  return (
    Object.keys(listDiff.value).length + syncRequest.data.missing.filter(el => !el.error).length
  );
});

function startSync() {
  syncing.value = true;
  totalItems.value = itemNumber.value;

  sync.syncList(syncRequest.data!.list, syncRequest.data!.missing);
}

function isExtension() {
  return api.type === 'webextension';
}

const backSync = ref(false);
async function updateBackgroundSyncState() {
  backSync.value = await sync.background.isEnabled();
}
const backgroundSync = computed({
  get() {
    return backSync.value;
  },
  set(value) {
    if (value) {
      sync.background.enable().finally(updateBackgroundSyncState);
    } else {
      sync.background.disable().finally(updateBackgroundSyncState);
    }
  },
});
updateBackgroundSyncState();
</script>

<style lang="less" scoped>
@import '../../less/_globals.less';

.list-sync {
  margin: @spacer-half 0;
}

.provider {
  &-item {
    display: flex;
    flex-direction: column;
    gap: 5px;
    &-content {
      display: flex !important;
      flex-direction: column;
      gap: 5px;
    }
  }
}

.provider-section {
  align-items: end;
  display: flex;
  flex-wrap: wrap;
  grid-gap: 5px;
  :deep(a) {
    color: var(--cl-secondary);
  }
}

.listDiff {
  .listDiff-inner {
    display: flex;
    gap: 5px;
  }

  .highlight {
    background-color: var(--cl-primary);
    padding-left: 5px;
    padding-right: 5px;
    border-radius: 5px;
  }
}
</style>
