<template>
  <div class="quicklinkedit">
    <div class="grid">
      <div
        v-for="link in linksWithState"
        :key="link.name"
        class="mdl-chip quicklink"
        :class="{
          active: link.active,
        }"
        @click="toggleLink(link)"
      >
        <FormButton :animation="false" :icon="groupIcon(link)" class="btn">
          <TextIcon :src="favicon(link.domain)">{{ link.name }}</TextIcon>
        </FormButton>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { quicklinks } from '../../../utils/quicklinksBuilder';
import FormButton from '../form/form-button.vue';
import TextIcon from '../text-icon.vue';

function stateNumber(link) {
  if (link.custom) return 0;
  if (link.database) return 1;
  if (link.search && !(link.search.anime === 'home' || link.search.manga === 'home')) return 2;
  return 10;
}

const model = computed({
  get() {
    return api.settings.get('quicklinks');
  },
  set(value) {
    api.settings.set('quicklinks', value);
  },
});

const search = ref('');

const linksWithState = computed(() => {
  return [...quicklinks, ...model.value.filter(el => typeof el === 'object' && el)]
    .filter(el => {
      if (!search.value) return true;
      return el.name.toLowerCase().includes(search.value.toLowerCase());
    })
    .map(el => {
      el.active = model.value.includes(el.name) || el.custom;
      return el;
    })
    .sort((a, b) => a.name.localeCompare(b.name))
    .sort((a, b) => {
      return stateNumber(a) - stateNumber(b);
    });
});

const favicon = (url: string) => {
  return utils.favicon(url.split('/')[2]);
};

const groupIcon = el => {
  console.log(el);
  if (el.custom) return 'tune';
  if (el.database) return 'link';
  if (el.search && !(el.search.anime === 'home' || el.search.manga === 'home')) return 'search';
  return 'home';
};
</script>

<style lang="less" scoped>
@import '../../less/_globals.less';
.quicklinkedit {
  padding: @spacer-half 0;
}

.grid {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 15px;
}

.quicklink {
  opacity: 0.5;
  filter: grayscale(1);
  &.active {
    opacity: 1;
    filter: none;
  }
}
</style>
