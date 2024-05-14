<template>
  <Section class="block-wrapper">
    <component :is="page.card ? Card : 'div'" style="max-width: 100%">
      <div class="progress-bar" :style="`width: ${progress}%`"></div>
      <div class="block-section" :class="{ limited: page.limited }">
        <component :is="page.component" @back="current--" @next="current++" />
        <div :style="`width: 1000px; flex-grow: ${page.buttons ? '1' : '0'}`"></div>
        <component :is="!page.card ? Card : 'div'" v-if="page.buttons">
          <div class="button-section">
            <FormButton v-if="current" class="open-button" @click="current--">
              {{ lang('back') }}
            </FormButton>
            <FormButton
              v-if="!lastPage && page.buttons !== 'back'"
              class="open-button button-next"
              color="primary"
              @click="current++"
            >
              {{ lang('next') }}
            </FormButton>
          </div>
        </component>
      </div>
    </component>
  </Section>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import Card from '../components/card.vue';
import FormButton from '../components/form/form-button.vue';
import installStart from '../components/install/install-start.vue';
import installHow from '../components/install/install-how.vue';
import installCorrect from '../components/install/install-correct.vue';
import installLinks from '../components/install/install-links.vue';
import installPermissions from '../components/install/install-permissions.vue';
import installProvider from '../components/install/install-provider.vue';
import installLogin from '../components/install/install-login.vue';
import Section from '../components/section.vue';

const pages = [
  {
    component: installStart,
    card: true,
    limited: true,
    buttons: true,
  },
  {
    component: installHow,
    card: true,
    limited: true,
    buttons: true,
  },
  {
    component: installCorrect,
    card: true,
    limited: true,
    buttons: true,
  },
  {
    component: installLinks,
    card: false,
    limited: false,
    buttons: true,
  },
  {
    component: installProvider,
    card: true,
    limited: true,
    buttons: 'back',
  },
  {
    component: installPermissions,
    card: true,
    limited: true,
    buttons: false,
  },
  {
    component: installLogin,
    card: true,
    limited: true,
    buttons: false,
  },
];

const current = ref(0);

const page = computed(() => pages[current.value]);
const lastPage = computed(() => current.value === pages.length - 1);

const progress = computed(() => (current.value / (pages.length - 1)) * 100);
</script>

<style lang="less" scoped>
.block-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  align-items: center;
  flex-grow: 1;
}

.block-section {
  min-height: 550px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  &.limited {
    max-width: 650px;
  }
}

.block-wrapper:deep(.button-section) {
  display: flex;
  justify-content: flex-start;
  gap: 15px;
  width: 100%;

  .button-next {
    width: 100%;
    flex-grow: 1;
  }
}

.progress-bar {
  position: fixed;
  left: 0;
  top: 0;
  height: 5px;
  background-color: var(--cl-primary);
  transition: width 0.3s ease-in-out;
}
</style>
