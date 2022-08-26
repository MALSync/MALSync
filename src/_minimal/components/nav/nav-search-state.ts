import { ref } from 'vue';

const typing = ref(false);

export function getTyping() {
  return typing.value;
}

export function setTyping(value) {
  typing.value = value;
}
