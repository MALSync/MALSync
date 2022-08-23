import { ref } from 'vue';

const typeContext = ref('anime');
const stateContext = ref(1);

export function setTypeContext(value: 'anime' | 'manga') {
  if (value === 'anime') {
    typeContext.value = 'anime';
  } else if (value === 'manga') {
    typeContext.value = 'manga';
  } else {
    throw `${value} not a valid State Context`;
  }
}

export function getTypeContext() {
  return typeContext;
}

export function setStateContext(value: number) {
  if (![0, 1, 2, 3, 4, 6, 7, 23].includes(value)) throw `${value} not a valid State`;
  stateContext.value = value;
}

export function getStateContext() {
  return stateContext;
}
