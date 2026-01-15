<template>
  <div class="color-preview">
    <div class="main-colors">
      <div
        v-for="colorCase in cases"
        :key="colorCase.name"
        class="top-color"
        :style="`background-color: var(--cl-${colorCase.name})`"
      >
        <div
          v-for="subColors in colorCase.colors"
          :key="subColors"
          class="sub-colors"
          :style="`background-color: var(--cl-${subColors})`"
        ></div>
      </div>
      <div
        v-for="stateColor in stateColors"
        :key="stateColor"
        class="top-color"
        :style="`background-color: var(--cl-state-${stateColor})`"
      >
        <div
          v-for="subColors in stateCases"
          :key="subColors"
          class="sub-colors"
          :style="`background-color: var(--cl-${subColors})`"
        ></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const cases = [
  {
    name: 'background',
    colors: ['text', 'light-text', 'primary', 'secondary', 'backdrop', 'border-hover'],
  },
  {
    name: 'foreground',
    colors: ['text', 'light-text', 'primary', 'border-hover'],
  },
  {
    name: 'foreground-solid',
    colors: ['text', 'light-text'],
  },
  {
    name: 'backdrop',
    colors: ['secondary'],
  },
  {
    name: 'primary',
    colors: ['white-text'],
  },
  {
    name: 'primary-dark',
    colors: ['white-text'],
  },
  {
    name: 'secondary',
    colors: ['white-text'],
  },
  {
    name: 'dark-background',
    colors: ['white-text'],
  },
];

const stateCases = ['background', 'foreground', 'foreground-solid'];
const stateColors = [0, 1, 2, 3, 4, 6, 23];
</script>

<style lang="less" scoped>
@import '../less/_globals.less';

.color-preview {
  border: 1px solid var(--cl-backdrop);
  margin: @spacer-half 0;
  .main-colors,
  .state-colors {
    display: flex;
  }
  .top-color {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 5px;
    min-height: 95px;
    padding: 5px;
  }

  .sub-colors {
    --cl-white-text: white;

    width: 100%;
    max-width: 20px;
    height: 10px;
    border-radius: 10px;
  }
}
</style>
