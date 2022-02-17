<template>
  <draggable
    id="quicklinksForSorting"
    v-model="value"
    group="people"
    :item-key="link => optionToCombined(link).name"
    @start="drag = true"
    @end="drag = false"
  >
    <template #item="{ element }">
      <div class="mdl-chip quicklink active" style="display: flex; align-items: center">
        <span class="material-icons" style="margin-right: 5px"> drag_handle </span>
        <img
          style="margin-right: 5px"
          :src="favicon(optionToCombined(element).domain)"
          height="16"
          width="16"
        />
        {{ optionToCombined(element).name }}
      </div>
    </template>
  </draggable>
</template>

<script lang="ts">
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
        return api.settings.get('quicklinks').filter(el => this.optionToCombined(el));
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
