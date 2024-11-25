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
            {{ lang('settings_listsync_master') }}
          </FormButton>
          <FormButton :animation="false" class="provider-item-content">
            <div>
              {{ provider.providerType }}
            </div>
            <div v-dompurify-html="provider.providerSettings.text" />
            <div>
              {{ lang('settings_listsync_list') }}
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
          {{ lang('settings_listsync_itemcount') }}
          <CodeBlock>
            <strong>{{ itemNumber }}</strong>
          </CodeBlock>
        </Section>

        <Section v-else spacer="half">
          {{ lang('settings_listsync_syncinprogress') }}
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
          {{ lang('settings_listsync_syncbutton') }}
        </FormButton>
      </Card>
    </Section>

    <Section v-if="!syncRequest.loading && listDiff">
      <Header spacer="half">{{ lang('settings_listsync_updates') }}</Header>
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
                <div>{{ lang('settings_listsync_score') }} {{ item.master.score }}</div>
                <div>
                  {{ lang(`settings_listsync_progress_${item.master.type}`) }}
                  {{ item.master.watchedEp }}
                </div>
                <div v-if="item.master.type === 'manga'">
                  {{ lang('settings_listsync_volume') }} {{ item.master.readVol }}
                </div>
                <div>
                  {{ lang('settings_listsync_status') }}
                  {{ getStatusText(item.master.type, item.master.status) }}
                </div>
                <div>
                  {{ lang('settings_listsync_startdate') }}
                  {{
                    item.master.startDate
                      ? getDateInLocale(item.master.startDate)
                      : lang('settings_listsync_unknowndate')
                  }}
                </div>
                <div>
                  {{ lang('settings_listsync_finishdate') }}
                  {{
                    item.master.finishDate
                      ? getDateInLocale(item.master.finishDate)
                      : lang('settings_listsync_unknowndate')
                  }}
                </div>
                <div>
                  {{ lang(`settings_listsync_repeatcount_${item.master.type}`) }}
                  {{ item.master.rewatchCount ?? 0 }}
                </div>
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
                  {{ lang('settings_listsync_score') }} {{ slave.score }}
                  <span v-if="slave.diff && slave.diff.score !== undefined">
                    → <text class="highlight">{{ slave.diff.score }}</text>
                  </span>
                </div>
                <div>
                  {{ lang(`settings_listsync_progress_${slave.type}`) }} {{ slave.watchedEp }}
                  <span v-if="slave.diff && slave.diff.watchedEp !== undefined">
                    → <text class="highlight">{{ slave.diff.watchedEp }}</text>
                  </span>
                </div>
                <div v-if="slave.type === 'manga'">
                  {{ lang('settings_listsync_volume') }} {{ slave.readVol }}
                  <span v-if="slave.diff && slave.diff.readVol !== undefined">
                    → <text class="highlight">{{ slave.diff.readVol }}</text>
                  </span>
                </div>
                <div>
                  {{ lang('settings_listsync_status') }}
                  {{ getStatusText(slave.type, slave.status) }}
                  <span v-if="slave.diff && slave.diff.status !== undefined">
                    →
                    <text class="highlight">{{
                      getStatusText(slave.type, slave.diff.status)
                    }}</text>
                  </span>
                </div>
                <div>
                  {{ lang('settings_listsync_startdate') }}
                  {{ slave.startDate ?? lang('settings_listsync_unknowndate') }}
                  <span v-if="slave.diff && slave.diff.startDate !== undefined">
                    →
                    <text class="highlight">{{
                      slave.diff.startDate
                        ? getDateInLocale(slave.diff.startDate)
                        : lang('settings_listsync_unknowndate')
                    }}</text>
                  </span>
                </div>
                <div>
                  {{ lang('settings_listsync_finishdate') }}
                  {{ slave.finishDate ?? lang('settings_listsync_unknowndate') }}
                  <span v-if="slave.diff && slave.diff.finishDate !== undefined">
                    →
                    <text class="highlight">{{
                      slave.diff.finishDate
                        ? getDateInLocale(slave.diff.finishDate)
                        : lang('settings_listsync_unknowndate')
                    }}</text>
                  </span>
                </div>
                <div>
                  {{ lang(`settings_listsync_repeatcount_${slave.type}`) }}
                  {{ slave.rewatchCount ?? 0 }}
                  <span v-if="slave.diff && slave.diff.rewatchCount !== undefined">
                    → <text class="highlight">{{ slave.diff.rewatchCount }}</text>
                  </span>
                </div>
              </FormButton>
            </div>
          </Card>
        </Section>
      </Description>
    </Section>

    <Section v-if="!syncRequest.loading && syncRequest.data && syncRequest.data.missing.length">
      <Header spacer="half">{{ lang('settings_listsync_missing') }}</Header>
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
              <div>{{ lang('settings_listsync_score') }} {{ item.score }}</div>
              <div>{{ lang(`settings_listsync_progress_${item.type}`) }} {{ item.watchedEp }}</div>
              <div v-if="item.type === 'manga'">
                {{ lang('settings_listsync_volume') }} {{ item.readVol }}
              </div>
              <div>
                {{ lang('settings_listsync_status') }} {{ getStatusText(item.type, item.status) }}
              </div>
              <div>
                {{ lang('settings_listsync_startdate') }}
                {{
                  item.startDate
                    ? getDateInLocale(item.startDate)
                    : lang('settings_listsync_unknowndate')
                }}
              </div>
              <div>
                {{ lang('settings_listsync_finishdate') }}
                {{
                  item.finishDate
                    ? getDateInLocale(item.finishDate)
                    : lang('settings_listsync_unknowndate')
                }}
              </div>
              <div>
                {{ lang(`settings_listsync_repeatcount_${item.type}`) }}
                {{ item.rewatchCount ?? 0 }}
              </div>
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
import { getDateInLocale } from '../../../utils/time';

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
    shiki: {
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
    shiki: listProvider.shiki,
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
