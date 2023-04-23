<template>
  <Section class="block-wrapper">
    <component :is="page.card ? Card : 'div'" class="">
      <div class="block-section" :class="{ limited: page.limited }">
        <div>
          <component :is="page.component" />
        </div>
        <div style="width: 1000px; flex-grow: 1"></div>
        <component :is="!page.card ? Card : 'div'" class="button-section">
          <FormButton v-if="current" class="open-button" @click="current--"> Back </FormButton>
          <FormButton
            v-if="!lastPage"
            class="open-button button-next"
            color="primary"
            @click="current++"
          >
            Next
          </FormButton>
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
import Section from '../components/section.vue';

const pages = [
  {
    component: installStart,
    card: true,
    limited: true,
  },
  {
    component: installHow,
    card: true,
    limited: true,
  },
  {
    component: installCorrect,
    card: true,
    limited: true,
  },
  {
    component: installLinks,
    card: false,
    limited: false,
  },
];

const current = ref(0);

const page = computed(() => pages[current.value]);
const lastPage = computed(() => current.value === pages.length - 1);
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
  min-height: 520px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  &.limited {
    max-width: 650px;
  }
}

.button-section {
  display: flex;
  justify-content: flex-start;
  gap: 15px;

  .button-next {
    flex-grow: 1;
  }
}
</style>
