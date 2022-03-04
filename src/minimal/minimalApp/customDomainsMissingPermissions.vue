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
            <td>{{ permission.page }}</td>
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
import { hasDomainPermission } from '../../utils/manifest';
import { greaterOrEqualCurrentVersion } from '../../utils/version';

export default {
  props: {
    currentCustomDomains: {
      type: Array as PropType<domainType[]>,
      default: () => [],
    },
  },
  emits: ['add-custom-domain'],
  data() {
    return {
      missingPermissions: {},
    };
  },
  computed: {
    formattedMissingPermissions() {
      const formatted: domainType[] = [];

      for (const key in this.missingPermissions) {
        this.missingPermissions[key].forEach(perm => {
          formatted.push({
            page: key,
            domain: perm,
            auto: true,
          });
        });
      }

      return formatted;
    },
    neededPermissions() {
      // check if already added or already in the manifest
      return this.formattedMissingPermissions
        .filter(perm => {
          return !this.currentCustomDomains.some(
            currentPerm => currentPerm.page === perm.page && currentPerm.domain === perm.domain,
          );
        })
        .filter(perm => !hasDomainPermission(perm.domain));
    },
  },
  mounted() {
    this.getMissingPermissions();
  },
  methods: {
    lang: api.storage.lang,
    getMissingPermissions() {
      api.request.xhr('GET', 'https://api.malsync.moe/general/permissions').then(response => {
        const permissions: { [index: string]: { [index: string]: string[] } } = JSON.parse(
          response.responseText,
        );
        // Versions that are gte than the current version
        const versions = Object.keys(permissions)
          .filter(key => key !== 'ttl')
          .filter(key => greaterOrEqualCurrentVersion(key));

        const missingPermissions = versions.reduce((acc, version) => {
          for (const key in permissions[version]) {
            if (acc[key]) {
              acc[key] = acc[key].concat(permissions[version][key]);
            } else {
              acc[key] = permissions[version][key];
            }
          }
          return acc;
        }, {});

        this.missingPermissions = missingPermissions;
      });
    },
    add() {
      this.$emit('add-custom-domain', this.neededPermissions);
    },
  },
};
</script>
