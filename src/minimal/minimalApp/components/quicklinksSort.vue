<template>
  <draggable id="quicklinksForSorting" v-model="value" group="people" @start="drag = true" @end="drag = false">
    <div
      v-for="link in value"
      :key="optionToCombined(link).name"
      class="mdl-chip quicklink active"
      style="display: flex; align-items: center;"
    >
      <span class="material-icons" style="margin-right: 5px;">
        drag_handle
      </span>
      <img style="margin-right: 5px;" :src="favicon(optionToCombined(link).domain)" height="16" width="16" />
      {{ optionToCombined(link).name }}
    </div>
  </draggable>
</template>

<script type="text/javascript">
import draggable from 'vuedraggable';
import { optionToCombined } from '../../../utils/quicklinksBuilder';

export default {
  components: {
    draggable,
  },
  data() {
    return {};
  },
  computed: {
    value: {
      get() {
        return api.settings.get('quicklinks');
      },
      set(value) {
        api.settings.set('quicklinks', value);
        this.$emit('changed', value);
      },
    },
  },
  methods: {
    optionToCombined,
    favicon(url) {
      try {
        return utils.favicon(url);
      } catch (e) {
        con.error(e);
        return '';
      }
    },
  },
};
</script>
