<template>
  <Card class="clear-tags">
    <Header :spacer="true">This script removes all malsync::xxxxx:: from your list.</Header>
    <FormButton v-if="!running" color="primary" @click="cleanTags()"
      >Clean Up MAL-Sync Tags</FormButton
    >
    <div v-else-if="!done">
      <Section spacer="half">
        <FormButton :animation="false">
          Anime:
          {{ !animeList.length ? 'loading' : `${animeLength - animeList.length}/${animeLength}` }}
        </FormButton>
      </Section>
      <FormButton :animation="false">
        Manga:
        {{ !mangaList.length ? 'loading' : `${mangaLength - mangaList.length}/${mangaLength}` }}
      </FormButton>
    </div>
    <div v-else>
      <FormButton :animation="false" color="secondary"> Done </FormButton>
    </div>
  </Card>
</template>

<script lang="ts" setup>
import { Ref, ref } from 'vue';
import { getOnlyList } from '../../../_provider/listFactory';
import { getSingle } from '../../../_provider/singleFactory';
import Card from '../card.vue';
import FormButton from '../form/form-button.vue';
import Header from '../header.vue';
import Section from '../section.vue';

defineProps({
  title: {
    type: String,
    required: true,
  },
});

const running = ref(false);
const done = ref(false);

const animeLength = ref(0);
const mangaLength = ref(0);
const animeList = ref([]);
const mangaList = ref([]);

async function removeTags(url) {
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

async function clean(
  type: 'anime' | 'manga',
  lengthVariable: Ref<number>,
  listVariable: Ref<any[]>,
) {
  listVariable.value = await getList(type);
  lengthVariable.value = listVariable.value.length;

  while (listVariable.value.length) {
    const anime = listVariable.value.pop()!;
    const streamUrl = utils.getUrlFromTags(anime.tags);

    if (typeof streamUrl !== 'undefined') {
      console.log(streamUrl);
      await removeTags(anime.url);
    }
  }
}

async function cleanTags() {
  running.value = true;
  await clean('anime', animeLength, animeList);
  await clean('manga', mangaLength, mangaList);
  done.value = true;
}
</script>

<style lang="less" scoped>
@import '../../less/_globals.less';
.clear-tags {
  margin: @spacer-half 0;
}
</style>
