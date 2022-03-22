<template>
  <div>
    <backbutton />
    <div class="mdl-cell bg-cell mdl-cell--6-col mdl-cell--8-col-tablet mdl-shadow--4dp">
      <div class="mdl-card__title mdl-card--border">
        <h2 class="mdl-card__title-text">{{ lang('settings_custom_domains_button') }}</h2>
      </div>
      <div class="mdl-card__supporting-text">
        Please only use if you know what you are doing!<br />
        More info <a href="https://github.com/MALSync/MALSync/wiki/Custom-Domains">here</a>
      </div>
    </div>
    <customDomainsMissingPermissions
      :current-custom-domains="option"
      :options="options"
      @add-custom-domain="addPermissionsFromChild"
    />
    <div class="mdl-cell bg-cell mdl-cell--6-col mdl-cell--8-col-tablet mdl-shadow--4dp">
      <div v-for="(perm, index) in permissions" :key="index">
        <li class="mdl-list__item" style="padding-top: 0; padding-bottom: 0">
          <div class="icon material-icons close-icon" @click="removePermission(index)">close</div>
          <div class="cell-content">
            <span class="mdl-list__item-primary-content">
              <select
                v-model="perm.page"
                name="myinfo_score"
                class="inputtext mdl-textfield__input"
                style="outline: none; margin-left: 10px; margin-right: 10px; min-width: 124px"
                :disabled="perm.auto"
                :class="{ error: !pageCheck(perm.page) }"
              >
                <option value="" disabled selected>Select Page</option>
                <option v-for="optionEl in options" :key="optionEl.key" :value="optionEl.key">
                  {{ optionEl.title }} <span v-if="perm.auto">(Auto)</span>
                </option>
              </select>
            </span>
            <span class="mdl-list__item-secondary-action">
              <div class="mdl-textfield mdl-js-textfield">
                <input
                  v-model="perm.domain"
                  class="mdl-textfield__input"
                  type="text"
                  placeholder="Domain"
                  style="outline: none"
                  :disabled="perm.auto"
                  :class="{ error: !domainCheck(perm.domain), disabled: perm.auto }"
                />
              </div>
            </span>
          </div>
        </li>
      </div>

      <div>
        <li class="mdl-list__item" style="padding-top: 0; padding-bottom: 0">
          <button
            class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab"
            @click="addPermission()"
          >
            <i class="material-icons">add</i>
          </button>
          <span class="mdl-list__item-primary-content"></span>
        </li>
      </div>

      <div v-if="!hasPermissions || JSON.stringify(option) !== JSON.stringify(permissions)">
        <li class="mdl-list__item" style="padding-top: 0; padding-bottom: 0">
          <input
            type="button"
            :value="lang('Update')"
            class="inputButton btn-middle flat js-anime-update-button mdl-button mdl-js-button mdl-button--raised mdl-button--colored"
            style="margin-right: 5px"
            data-upgraded=",MaterialButton"
            @click="savePermissions()"
          />
          <span class="mdl-list__item-primary-content"></span>
        </li>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import backbutton from './components/backbutton.vue';
import customDomainsMissingPermissions from './customDomainsMissingPermissions.vue';
import { getPageOptions } from '../../utils/customDomains';

export default {
  components: {
    backbutton,
    customDomainsMissingPermissions,
  },
  data() {
    return {
      options: getPageOptions(),
      permissions: [],
      hasPermissions: null,
    };
  },
  computed: {
    option: {
      get() {
        return api.settings.get('customDomains');
      },
      set(value) {
        api.settings.set('customDomains', value);
      },
    },
    browserPermissions() {
      const origins = this.permissions
        .filter(perm => {
          try {
            const url = new URL(perm.domain);
            return Boolean(url.origin);
          } catch (_) {
            return false;
          }
        })
        .map(perm => `${new URL(perm.domain).origin}/`);
      return {
        permissions: ['webNavigation'],
        origins,
      };
    },
  },
  watch: {
    option(value) {
      this.permissions = JSON.parse(JSON.stringify(value));
    },
    browserPermissions() {
      this.checkPermissions();
    },
  },
  activated() {
    this.permissions = JSON.parse(JSON.stringify(this.option));
  },
  mounted() {
    this.permissions = JSON.parse(JSON.stringify(this.option));
    this.$root.updateDom();
  },
  methods: {
    lang: api.storage.lang,
    addPermission() {
      this.permissions.push({ domain: '', page: '' });
      this.$root.updateDom();
    },
    removePermission(index) {
      this.permissions.splice(index, 1);
    },
    savePermissions() {
      if (
        !this.permissions.every(el => {
          return this.domainCheck(el.domain) && this.pageCheck(el.page);
        })
      ) {
        alert('Configuration could not be saved. Check if everything is configured correctly.');
        return;
      }
      this.option = JSON.parse(JSON.stringify(this.permissions));
      this.requestPermissions();
    },
    pageCheck(page) {
      return !!page;
    },
    domainCheck(domain) {
      let origin;
      try {
        origin = new URL(domain).origin;
      } catch (e) {
        console.log(e);
        return false;
      }

      return (
        /^https?:\/\/(localhost|(?:www?\d?\.)?((?:(?!www\.|\.).)+\.[a-zA-Z0-9.]+))/.test(domain) &&
        origin
      );
    },
    checkPermissions() {
      chrome.permissions.contains(this.browserPermissions, result => {
        this.hasPermissions = result;
      });
    },
    requestPermissions() {
      con.m('Request Permissions').log(this.browserPermissions);
      chrome.permissions.request(this.browserPermissions, granted => {
        if (!granted) utils.flashm('Requesting the permissions failed', { error: true });
        this.checkPermissions();
      });
    },
    addPermissionsFromChild(permissions) {
      con.log('Add missing Permissions', permissions);
      this.permissions = this.permissions.concat(permissions);
      this.savePermissions();
    },
  },
};
</script>
<style lang="less" scoped>
.mdl-textfield__input {
  &:focus {
    border-bottom: 1px solid green;
  }
  &.error {
    border-bottom: 1px solid red;
  }
  &.tempRec {
    border-bottom: 1px solid orange;
  }
  &.disabled {
    opacity: 0.5;
  }
}

.cell-content {
  display: flex;

  @media (max-width: 450px) {
    flex-wrap: wrap;
    justify-content: flex-end;
  }
}
</style>
