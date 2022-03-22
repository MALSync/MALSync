<template>
  <div
    v-if="neededPermissions && neededPermissions.length"
    class="mdl-cell bg-cell mdl-cell--6-col mdl-cell--8-col-tablet mdl-shadow--4dp"
    style="border: 1px solid red"
  >
    <div class="mdl-card__title mdl-card--border">
      <h2 class="mdl-card__title-text">
        {{ lang('settings_custom_domains_missing_permissions_header') }}
      </h2>
    </div>
    <div class="mdl-card__supporting-text">
      <table>
        <tbody>
          <tr v-for="permission in neededPermissions" :key="permission.domain">
            <td>{{ getPageName(permission.page) }}</td>
            <td>⬌</td>
            <td>{{ permission.domain }}</td>
          </tr>
        </tbody>
      </table>

      <br />

      <input
        type="button"
        :value="lang('Add')"
        class="inputButton btn-middle flat js-anime-update-button mdl-button mdl-js-button mdl-button--raised mdl-button--accent"
        style="margin-top: 5px"
        data-upgraded=",MaterialButton"
        @click="add()"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { PropType } from 'vue';
import { domainType } from '../../background/customDomain';
import { MissingPermissions } from '../../utils/customDomains';

export default {
  props: {
    currentCustomDomains: {
      type: Array as PropType<domainType[]>,
      default: () => [],
    },
    options: {
      type: Array as PropType<{ key: string; title: string }[]>,
      default: () => [],
    },
  },
  emits: ['add-custom-domain'],
  data() {
    return {
      missingPermissions: new MissingPermissions(),
    };
  },
  computed: {
    neededPermissions() {
      return this.missingPermissions.getMissingPermissions(this.currentCustomDomains);
    },
  },
  mounted() {
    this.missingPermissions.init();
  },
  methods: {
    lang: api.storage.lang,
    add() {
      this.$emit('add-custom-domain', this.neededPermissions);
    },
    getPageName(key: string) {
      const page = this.options.find(pageEl => pageEl.key === key);
      return page ? page.title : key;
    },
  },
};
</script>
