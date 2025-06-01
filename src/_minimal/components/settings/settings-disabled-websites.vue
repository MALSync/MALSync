<template>
  <Card v-if="Object.keys(pageArray).length" class="disabledWebsites">
    <Header v-if="onlyDisabled" :spacer="true" weight="normal">
      {{ lang('settings_tracking_disabled') }}
    </Header>
    <SettingsGeneral
      v-for="(page, key) in pageArray as any"
      :key="key"
      component="checkbox"
      title=""
      :value="true"
    >
      <template #title>
        <MediaLink :href="getDomain(page)">
          <TextIcon :src="favicon(getDomain(page))">{{ page.name }}</TextIcon>
        </MediaLink>
      </template>
      <template #component>
        <FormCheckbox
          :model-value="getPageState(page)"
          @update:model-value="newValue => setPageState(page, newValue)"
        />
      </template>
    </SettingsGeneral>
  </Card>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import Card from '../card.vue';
import SettingsGeneral from './settings-general.vue';
import { getAllPages } from '../../../utils/quicklinksBuilder';
import MediaLink from '../media-link.vue';
import TextIcon from '../text-icon.vue';
import FormCheckbox from '../form/form-checkbox.vue';
import Header from '../header.vue';

const props = defineProps({
  onlyDisabled: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['change']);

const model = computed({
  get() {
    return api.settings.get('enablePages');
  },
  set(value) {
    api.settings.set('enablePages', value);
    emit('change', value);
  },
});

function getPageState(page) {
  return Boolean(typeof model.value[page.name] === 'undefined' || model.value[page.name]);
}

function setPageState(page, state) {
  const curState = JSON.parse(JSON.stringify(model.value));
  curState[page.name] = state;
  model.value = curState;
}

const pageArray = computed(() => {
  const res = {};
  getAllPages().forEach(page => {
    if (props.onlyDisabled && getPageState(page)) return;
    res[page.key] = page;
  });
  return res;
});

function getDomain(page) {
  if (typeof page.domain === 'object') {
    return page.domain[0];
  }
  return page.domain;
}

function favicon(url: string) {
  return utils.favicon(url.split('/')[2]);
}
</script>

<style lang="less" scoped>
@import '../../less/_globals.less';

.disabledWebsites {
  margin: @spacer-half 0;
}
</style>
