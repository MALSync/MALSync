import { ref, watch } from 'vue';
import { Cache } from '../../utils/Cache';
import { localStore } from '../../utils/localStore';

const STORAGE_KEY = 'VUE-MAL-SYNC-V2';
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

init();
async function init() {
  const cache = new Cache('stateContext', 14 * 24 * 60 * 60 * 1000);
  if (await cache.hasValue()) {
    const curContext = await cache.getValue();
    if (curContext.stateContext) setStateContext(curContext.stateContext);
    if (curContext.typeContext) setTypeContext(curContext.typeContext);
  }
  watch([typeContext, stateContext], () => {
    cache.setValue({
      stateContext: stateContext.value,
      typeContext: typeContext.value,
    });
  });
}

export function getUrlObj() {
  return JSON.parse(localStore.getItem(STORAGE_KEY) || 'null');
}

export function setUrlObj(url: string) {
  localStore.setItem(STORAGE_KEY, JSON.stringify({ url, timestamp: Date.now() }));
}
