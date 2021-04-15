<template>
  <div class="mdl-grid bg-cell" style="display: block;">
    <h5>This script removes all malsync::xxxxx:: from your list.</h5>
    <button
      type="button"
      :disabled="animeLoading"
      class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored"
      style="margin-bottom: 20px;"
      @click="cleanTags()"
    >
      Clean Up Mal-Sync Tags
    </button>
    <br />
    Anime:
    <span v-if="animeLoading && !animelistLength">Loading</span>
    <span v-if="animelistLength">{{ animelistLength - animelist.length }}/{{ animelistLength }}</span>
    <br />
    Manga:
    <span v-if="mangaLoading && !mangalistLength">Loading</span>
    <span v-if="mangalistLength">{{ mangalistLength - mangalist.length }}/{{ mangalistLength }}</span
    ><br />
  </div>
</template>

<script type="text/javascript">
import { getSingle } from '../../../_provider/singleFactory';
import { getOnlyList } from '../../../_provider/listFactory';

async function cleanTags(url) {
  const entryClass = getSingle(url);
  return entryClass
    .update()
    .then(() => {
      entryClass.cleanTags();
      return entryClass.sync();
    })
    .catch(e => {
      con.error(e);
    });
}

function getList(type) {
  const listProvider = getOnlyList(7, type);
  return listProvider
    .getCompleteList()
    .then(list => {
      return list;
    })
    .catch(e => {
      con.error(e);
      throw listProvider.errorMessage(e);
    });
}

export default {
  props: {},
  data() {
    return {
      animeLoading: false,
      animelist: null,
      animelistLength: null,
      mangaLoading: false,
      mangalist: null,
      mangalistLength: null,
    };
  },
  computed: {},
  watch: {},
  methods: {
    lang: api.storage.lang,
    cleanTags() {
      this.animeLoading = true;
      getList('anime')
        .then(async list => {
          this.animelist = list;
          this.animelistLength = this.animelist.length;

          while (this.animelist.length) {
            const anime = this.animelist.pop();
            const streamUrl = utils.getUrlFromTags(anime.tags);

            if (typeof streamUrl !== 'undefined') {
              console.log(streamUrl);
              await cleanTags(anime.url);
            }
          }
        })
        .then(() => {
          return getList('manga');
        })
        .then(async list => {
          this.mangalist = list;
          this.mangalistLength = this.mangalist.length;

          while (this.mangalist.length) {
            const manga = this.mangalist.pop();
            const streamUrl = utils.getUrlFromTags(manga.tags);

            if (typeof streamUrl !== 'undefined') {
              await cleanTags(manga.url);
            }
          }
        });
    },
  },
};
</script>
