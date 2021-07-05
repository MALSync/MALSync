<template>
  <div id="quicklinkoverview">
    <div v-if="links && links.length" class="quicklinks">
      <div v-for="link in links" :key="link.name" class="mdl-chip quicklink">
        <img style="padding-bottom: 3px; margin-right: 5px;" :src="favicon(link.domain)" height="16" width="16" />
        {{ link.name }}
      </div>
    </div>
    <div v-else>
      <input
        type="button"
        :value="lang('Add')"
        class="inputButton btn-middle flat js-anime-update-button mdl-button mdl-js-button mdl-button--raised mdl-button--accent"
        data-upgraded=",MaterialButton"
      />
    </div>
  </div>
</template>

<script type="text/javascript">
import { combinedLinks } from '../../../utils/quicklinksBuilder';

export default {
  computed: {
    links() {
      return combinedLinks();
    },
  },
  methods: {
    lang: api.storage.lang,
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
