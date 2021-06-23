<template>
  <div id="quicklinkedit">
    <quicklinksOverview />
    edit
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
import quicklinksOverview from './quicklinksOverview.vue';
import quicklinks from '../../../utils/quicklinks.json';

export default {
  components: {
    quicklinksOverview,
  },
  data() {
    return {
      quicklinks,
      active: [
        'Zoro',
        {
          active: 'true',
          name: 'custom',
          type: 'anime',
          search: 'https://google.de/{searchterm}',
        },
      ],
    };
  },
  computed: {
    linksWithState() {
      return this.quicklinks
        .map(el => {
          el.active = this.active.includes(el.name);
          return el;
        })
        .sort((a, b) => a.name.localeCompare(b.name))
        .sort((a, b) => {
          return this.stateNumber(a) - this.stateNumber(b);
        });
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
        this.active.splice(this.active.indexOf(link.name), 1);
      } else {
        this.active.push(link.name);
      }
    },
    stateNumber(link) {
      if (link.database) return 0;
      if (link.search) return 1;
      return 10;
    }
  },
};
</script>
