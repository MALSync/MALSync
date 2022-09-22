<template>
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

    <Section v-if="providerList" class="provider">
      <Grid>
        <div
          v-for="provider in (Object.values(providerList) as any[])"
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
      </Grid>
    </Section>

    <Section v-if="syncRequest.loading" class="spinner-wrap"><Spinner /></Section>
  </Card>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue';
import * as sync from '../../../utils/syncHandler';
import { createRequest } from '../../utils/reactive';
import Card from '../card.vue';
import FormSwitch from '../form/form-switch.vue';
import FormButton from '../form/form-button.vue';
import Section from '../section.vue';
import Grid from '../grid.vue';
import Spinner from '../spinner.vue';

const mode = 'mirror';

const providerList = ref(null as any);

const parameters = ref({
  type: 'anime',
});

const syncRequest = createRequest(parameters, async params => {
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

  const listOptions = await sync.retriveLists(providerList.value, params.type, sync.getList);

  const list = [];
  const missing = [];

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
</style>
