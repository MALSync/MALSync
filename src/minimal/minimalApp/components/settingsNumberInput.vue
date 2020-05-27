<template>
  <li class="mdl-list__item">
    <span class="mdl-list__item-primary-content">
      <slot />
    </span>
    <span class="mdl-list__item-secondary-action">
      <div class="mdl-textfield mdl-js-textfield" style="min-width: 35px; max-width: 35px; width: 100%; padding: 0;">
        <input
          :id="option"
          v-model="value"
          class="mdl-textfield__input"
          type="number"
          :step="step"
          :min="min"
          :max="max"
          style="text-align: center;"
        />
      </div>
    </span>
  </li>
</template>

<script type="text/javascript">
export default {
  props: {
    option: {
      type: String,
    },
    min: {
      type: Number,
      default: 0,
    },
    max: {
      type: Number,
      default: 999,
    },
    step: {
      type: Number,
      default: 1,
    },
  },
  computed: {
    value: {
      get() {
        return api.settings.get(this.option);
      },
      set(value) {
        if (value !== '' && value !== null && value >= this.min && value <= this.max) {
          api.settings.set(this.option, value);
          this.$emit('changed', value);
        }
      },
    },
  },
};
</script>
