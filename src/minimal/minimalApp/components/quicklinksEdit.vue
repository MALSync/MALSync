<template>
  <div id="quicklinkedit">
    <div style="margin-bottom: 20px;">
      <input v-model="search" type="text" class="mdl-textfield__input" placeholder="Search" />
    </div>
    <div class="quicklinks">
      <div
        v-for="link in linksWithState"
        :key="link.name"
        class="mdl-chip quicklink"
        :class="{
          active: link.active,
          database: link.database,
          search: link.search,
          home: !link.search && !link.database,
        }"
        @click="toggleLink(link)"
      >
        <img style="padding-bottom: 3px; margin-right: 5px;" :src="favicon(link.domain)" height="16" width="16" />
        {{ link.name }}
      </div>
    </div>
  </div>
</template>

<script type="text/javascript">
import quicklinks from '../../../utils/quicklinks.json';

export default {
  data() {
    return {
      quicklinks,
      search: '',
    };
  },
  computed: {
    linksWithState() {
      return this.quicklinks
        .filter(el => {
          if (!this.search) return true;
          return el.name.toLowerCase().includes(this.search.toLowerCase());
        })
        .map(el => {
          el.active = this.value.includes(el.name);
          return el;
        })
        .sort((a, b) => a.name.localeCompare(b.name))
        .sort((a, b) => {
          return this.stateNumber(a) - this.stateNumber(b);
        });
    },
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
    favicon(url) {
      try {
        return utils.favicon(url);
      } catch (e) {
        con.error(e);
        return '';
      }
    },
    toggleLink(link) {
      if (link.active) {
        this.value.splice(this.value.indexOf(link.name), 1);
      } else {
        this.value.push(link.name);
      }
      this.value = [...this.value];
    },
    stateNumber(link) {
      if (link.database) return 0;
      if (link.search) return 1;
      return 10;
    }
  },
};
</script>
