<template>
  <li class="mdl-list__item">
    <span class="mdl-list__item-primary-content">
      <slot />
    </span>
    <span class="mdl-list__item-secondary-action">
      <label class="mdl-switch mdl-js-switch mdl-js-ripple-effect" :for="option">
        <input :id="option" v-model="value" type="checkbox" class="mdl-switch__input" />
      </label>
    </span>
  </li>
</template>

<script type="text/javascript">
export default {
  props: {
    option: {
      type: String,
    },
  },
  computed: {
    value: {
      get() {
        return api.settings.get(this.option);
      },
      set(value) {
        api.settings.set(this.option, value);
      },
    },
  },
};
</script>
