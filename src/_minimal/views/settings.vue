<template>
  <div>
    <div v-if="components.path.length" class="back-button">
      <router-link :to="{ name: 'Settings', params: { path: [components.path.slice(0, -1)] } }">
        <Header>
          <TextIcon icon="arrow_back" mode="flex" background="round">
            {{ components.parent ? components.parent.title : 'Back' }}
          </TextIcon>
        </Header>
      </router-link>
    </div>
    <template v-for="comp in components.structure" :key="comp.key">
      <component
        :is="comp.component"
        v-if="comp.condition ? comp.condition() : true"
        v-bind="comp.props"
        :id="`id-${comp.key}`"
        :path="[...components.path, comp.key]"
        :title="comp.title"
        :class="{ highlight: comp.key === components.highlight }"
      />
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { structure, ConfObj } from '../components/settings/settings-structure';
import Header from '../components/header.vue';
import TextIcon from '../components/text-icon.vue';

const route = useRoute();

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
  return followPath(route.params.path as string[], structure);
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

  padding: @spacer-half 0;
}

.highlight {
  position: relative;
  &::after {
    content: '';
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
