<template>
  <div class="settings-block" :class="{ designed: !components.path.length }">
    <transition :name="components.path.length ? 'slide-in' : 'slide-out'">
      <div :key="components.path.join('/')">
        <Link
          v-if="components.path.length"
          :to="{ name: 'Settings', params: { path: [components.path.slice(0, -1).join('/')] } }"
        >
          <div class="back-button">
            <Header weight="normal">
              <TextIcon icon="arrow_back" mode="flex" background="round" spacer="big">
                {{
                  components.parent
                    ? typeof components.parent.title === 'function'
                      ? components.parent.title()
                      : components.parent.title
                    : 'Back'
                }}
              </TextIcon>
            </Header>
          </div>
        </Link>
        <template v-for="comp in components.structure" :key="comp.key">
          <TransitionSlide>
            <SettingsRendering
              :comp="comp"
              :highlight="components.highlight"
              :current-path="components.path"
            />
          </TransitionSlide>
        </template>
      </div>
    </transition>
    <SettingsDesigned v-if="!components.path.length" />
  </div>
</template>

<script lang="ts" setup>
import { computed, inject, PropType, watch } from 'vue';

import { structure } from '../components/settings/settings-structure';
import Header from '../components/header.vue';
import TextIcon from '../components/text-icon.vue';
import Link from '../components/link.vue';
import { ConfObj } from '../../_provider/definitions';
import TransitionSlide from '../components/transition-slide.vue';
import SettingsDesigned from '../components/settings/settings-designed.vue';
import SettingsRendering from '../components/settings/settings-rendering.vue';

const rootWindow = inject('rootWindow') as Window;
const rootDocument = inject('rootDocument') as Document;

const props = defineProps({
  path: {
    type: [Array, String] as PropType<string[] | string>,
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
        const el = rootDocument.getElementById(`id-${value}`);
        if (el) {
          const topOfElement = el.offsetTop - 90;
          rootWindow.scroll({ top: topOfElement, behavior: 'smooth' });
        }
      }, 100);
    }
  },
  { immediate: true },
);
</script>

<style lang="less" scoped>
@import '../less/_globals.less';

.settings-block {
  position: relative;
  flex-grow: 1;
  display: flex;
  flex-direction: column;

  .__breakpoint-popup__({
    &.designed {
      padding-bottom: 30px
    }
  });
}

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
