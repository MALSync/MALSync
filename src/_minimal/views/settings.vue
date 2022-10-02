<template>
  <div>
    <transition :name="components.path.length ? 'slide-in' : 'slide-out'">
      <div :key="components.path">
        <div v-if="components.path.length" class="back-button">
          <router-link :to="{ name: 'Settings', params: { path: [components.path.slice(0, -1)] } }">
            <Header>
              <TextIcon icon="arrow_back" mode="flex" background="round">
                {{
                  components.parent
                    ? typeof components.parent.title === 'function'
                      ? components.parent.title()
                      : components.parent.title
                    : 'Back'
                }}
              </TextIcon>
            </Header>
          </router-link>
        </div>
        <template v-for="comp in components.structure" :key="comp.key">
          <TransitionSlide>
            <component
              :is="comp.component"
              v-if="comp.condition ? comp.condition() : true"
              v-bind="typeof comp.props === 'function' ? comp.props() : comp.props"
              :id="`id-${comp.key}`"
              :path="[...components.path, comp.key]"
              :title="typeof comp.title === 'function' ? comp.title() : comp.title"
              :class="{ highlight: comp.key === components.highlight }"
              @change="comp.change ? comp.change() : null"
            />
          </TransitionSlide>
        </template>
      </div>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import { computed, PropType, watch } from 'vue';

import { structure } from '../components/settings/settings-structure';
import Header from '../components/header.vue';
import TextIcon from '../components/text-icon.vue';
import { ConfObj } from '../../_provider/definitions';
import TransitionSlide from '../components/transition-slide.vue';

const props = defineProps({
  path: {
    type: [Array, String] as PropType<string[]|string>,
    default: () => [],
  },
});

const followPath = (
  paths: string[],
  struct: ConfObj[],
  currentPath: string[] = [],
  parent: ConfObj | null = null,
) => {
  if (!paths)
    return {
      structure: struct,
      path: currentPath,
      parent,
    };
  const path = paths.shift();
  if (!path)
    return {
      structure: struct,
      path: currentPath,
      parent,
    };
  const tempStruct = struct.find(s => s.key === path);
  if (!tempStruct || !tempStruct.children)
    return {
      structure: struct,
      path: currentPath,
      parent,
      highlight: path,
    };
  currentPath.push(path);
  return followPath(paths, tempStruct.children, currentPath, tempStruct);
};
const components = computed(() => {
  return followPath(props.path as string[], structure);
});

watch(
  () => components.value.highlight,
  value => {
    if (value) {
      setTimeout(() => {
        const el = document.getElementById(`id-${value}`);
        if (el) {
          const topOfElement = el.offsetTop - 90;
          window.scroll({ top: topOfElement, behavior: 'smooth' });
        }
      }, 100);
    }
  },
  { immediate: true },
);
</script>

<style lang="less" scoped>
@import '../less/_globals.less';
.back-button {
  .click-move-down();

  padding: 0 0 @spacer-half;
}

.highlight {
  position: relative;
  &::after {
    content: '';
    pointer-events: none;
    position: absolute;
    top: 0;
    left: -20px;
    right: -20px;
    bottom: 0;
    border: 2px solid var(--cl-secondary);
    border-radius: 10px;
  }
}
</style>
