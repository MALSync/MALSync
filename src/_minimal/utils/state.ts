import { ref } from 'vue';

const stateContext = ref('anime');

export function setStateContent(value: 'anime' | 'manga') {
  if (value === 'anime') {
    stateContext.value = 'anime';
  } else if (value === 'manga') {
    stateContext.value = 'manga';
  } else {
    throw `${value} not a valid State Context`;
  }
}

export function getStateContext() {
  return stateContext;
}
