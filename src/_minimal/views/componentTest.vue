<template>
  <Section>
    <TransitionStaggered>
      <template v-for="item in list" :key="item.title">
        <BookmarksList :item="item as bookmarkItem" />
      </template>
    </TransitionStaggered>
  </Section>
  <Section>
    <Grid :min-width="130">
      <TransitionStaggered>
        <template v-for="item in list" :key="item.title">
          <BookmarksTiles :item="item as bookmarkItem" />
        </template>
      </TransitionStaggered>
    </Grid>
  </Section>
  <Section>
    <Grid :min-width="190">
      <TransitionStaggered>
        <template v-for="item in list" :key="item.title">
          <BookmarksCardsFull :item="item as bookmarkItem" />
        </template>
      </TransitionStaggered>
    </Grid>
  </Section>
  <Section>
    <Grid :min-width="350">
      <TransitionStaggered>
        <template v-for="item in list" :key="item.title">
          <BookmarksCards :item="item as bookmarkItem" />
        </template>
      </TransitionStaggered>
    </Grid>
  </Section>
  <Section>
    <div style="display: flex; gap: 20px; flex-wrap: wrap">
      <TransitionStaggered>
        <div v-for="index in 40" :key="index" class="transitionTest" />
      </TransitionStaggered>
    </div>
  </Section>
  <Section>
    <Grid :min-width="191">
      <imageLazy
        mode="cover"
        src="https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/nx19815-bIo51RMWWhLv.jpg"
      />
      <imageLazy src="" mode="cover" />
      <imageLazy src="https://s4.anilist.co/file/anilistcdn/medi" mode="cover" />
      <ImageFit
        mode="cover"
        src="https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/nx19815-bIo51RMWWhLv.jpg"
      />
      <ImageFit mode="cover" src="" />
      <ImageFit mode="cover" src="https://s4.anilist.co/file/anilistcdn/media/" />
    </Grid>
  </Section>
  <Section>
    <FormButton>Read More</FormButton>
    <FormButton padding="large">Load</FormButton>
  </Section>
  <Section>
    <Modal v-model="imgModal">
      <img
        src="https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/nx19815-bIo51RMWWhLv.jpg"
      />
    </Modal>
    <ImageFit
      style="width: 600px; height: 300px; max-width: 100%"
      src="https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/nx19815-bIo51RMWWhLv.jpg"
      @click="imgModal = true"
    />
  </Section>
  <Section>
    <Description
      >When a mysterious creature chops the moon down to a permanent crescent, the students of class
      class 3-E of Kunugigaoka Middle School find themselves confronted with an enormous task: task:
      assassinate the creature responsible for the disaster before Earth suffers a similar fate.
      However, the monster, dubbed Koro-sensei (the indestructible teacher), is able to fly at
      speeds of up to Mach 20, which he demonstrates freely, leaving any attempt to subdue him his
      extraterrestrial dust. Furthermore, the misfits of 3-E soon find that the strange, tentacled
      beast is more than just indomitable—he is the best teacher they have ever had! Adapted from
      the humorous hit manga by Yuusei Matsui, Ansatsu Kyoushitsu tells the story of these junior
      high pupils as they polish their assassination skills and grow in order to stand strong
      against the oppressive school system, their own life problems, and one day,
      Koro-sensei.[Written by MAL Rewrite]When a mysterious creature chops the moon down to a
      permanent crescent, the students of class 3-E of Kunugigaoka Middle School find themselves
      confronted with an enormous task: assassinate the creature responsible for the disaster before
      Earth suffers a similar fate. However, the monster, dubbed Koro-sensei (the indestructible
      teacher), is able to fly at speeds of up to Mach 20, which he demonstrates freely, leaving any
      attempt to subdue him in his extraterrestrial dust. Furthermore, the misfits of 3-E soon find
      that the strange, tentacled beast is more than just indomitable—he is the best teacher they
      have ever had! Adapted from the humorous hit manga by Yuusei Matsui, Ansatsu Kyoushitsu tells
      the story of these junior high pupils as they polish their assassination skills and grow in
      order to stand strong against the oppressive school system, their own life problems, and one
      Koro-sensei.[Written by MAL Rewrite]</Description
    >
    <Description>Short Description</Description>
  </Section>
  <Section>
    <FormCheckbox :model-value="true"></FormCheckbox>
    <FormCheckbox :model-value="false"></FormCheckbox>
  </Section>
  <Hr />
  <Section>
    <FormDropdown
      :options="[
        { title: 'test', value: '1' },
        { title: 'test2', value: '2' },
      ]"
      placeholder="place"
    ></FormDropdown>
    <FormDropdown
      :options="[
        { title: 'test', value: '1' },
        { title: 'test2', value: '2' },
      ]"
      placeholder="place"
      model-value="1"
    ></FormDropdown>
  </Section>
  <Section>
    <FormDropdown
      :options="[
        { title: 'test', value: '1' },
        { title: 'test2', value: '2' },
      ]"
      placeholder="place"
    >
      <template #select>
        <PillDark>5 Days 3 Hours</PillDark>
      </template>
    </FormDropdown>
    <PillSplit>
      <template #left>
        <TextIcon icon="star">10</TextIcon>
      </template>
      <template #right>
        <TextIcon src="https://www.google.com/s2/favicons?domain=crunchyroll.com">4</TextIcon>
      </template>
    </PillSplit>
  </Section>
  <Spinner />
  <Section>
    <ColorPreview />
  </Section>
  <Section>
    <FormColorPicker />
    <FormColorPicker model-value="#cacaca" />
  </Section>
  <Section>
    <FormSlider :min="50" :max="100" :interval="0.5" />
  </Section>
  <Section>
    <FormSlider
      color="violet"
      :options="[
        { title: 'test', value: '1' },
        { title: 'test2', value: '2' },
      ]"
    />
  </Section>
  <Section>
    <FormText suffix="%" />
  </Section>
  <Section>
    <SettingsGeneral title="test123" component="checkbox" />
    <SettingsGeneral title="test123" component="button" :props="{ title: 'Button' }" />
    <SettingsGeneral title="test123" component="colorPicker" />
    <SettingsGeneral title="test123" component="slider" :props="{ min: 50, max: 100 }" />
    <SettingsGeneral
      title="test123"
      component="dropdown"
      :props="{ options: [{ title: 'test', value: '1' }], placeholder: 'test' }"
    />
    <SettingsGeneral
      title="test123"
      component="switch"
      :props="{
        options: [
          { title: 'System', value: 'auto' },
          { title: 'Light', value: 'light' },
          { title: 'Dark', value: 'dark' },
        ],
      }"
    />
    <SettingsGeneral title="test123" component="input" />
  </Section>
  <Section>
    <SettingsGeneral
      :title="lang('settings_miniMAL_theme')"
      component="dropdown"
      option="theme"
      :props="{
        options: [
          { title: 'System', value: 'auto' },
          { title: 'Light', value: 'light' },
          { title: 'Dark', value: 'dark' },
          { title: 'Custom', value: 'custom' },
        ],
      }"
    />
    <SettingsGeneral title="Sidebars" option="themeSidebars" component="checkbox" />
    <SettingsGeneral
      v-if="getOption('theme') === 'custom'"
      title="Color"
      option="themeColor"
      component="colorPicker"
    />
    <SettingsGeneral
      v-if="getOption('theme') === 'custom'"
      title="Background Image"
      option="themeImage"
      component="input"
    />
    <SettingsGeneral
      v-if="getOption('theme') === 'custom' && getOption('themeImage')"
      title="Background Opacity"
      option="themeOpacity"
      component="slider"
    />
  </Section>
  <Section>
    <StateDot :status="1" />
    <StateDot :status="2" />
    <StateDot :status="3" />
    <StateDot :status="4" />
    <StateDot :status="6" />
    <StateDot :status="7" />
    <StateDot :status="23" />
  </Section>
  <Section>
    <Header>Related Content</Header>
    <Header><StateDot :status="1" />Character</Header>
    <Header :loading="true"><StateDot :status="1" />Character</Header>
    <ImageFit mode="cover" src="" :loading="true" style="width: 200px" />
    <Description :loading="true">Short Description</Description>
  </Section>
  <Section>
    <TextScroller
      >Score 8.13 Rank 379 Popularity 42 Members 1,176,966 Premiered: Winter 2015</TextScroller
    >
    <TextScroller
      >Score 8.13 Rank 379 Popularity 42 Members 1,176,966 Premiered: Winter 2015 Premiered: Winter
      2015 Premiered: Winter 2015 Premiered: Winter 2015 Members 1,176,966 Premiered: Winter 2015
      Premiered: Winter 2015 Premiered: Winter 2015 Premiered: Winter 2015</TextScroller
    >
  </Section>
  <Section>
    <Bars
      :bars="[
        { color: 'red', width: 50 },
        { color: 'blue', width: 40 },
      ]"
    />
  </Section>
  <Section>
    <FormSwitch
      :options="[
        { title: 'System', value: 'auto' },
        { title: 'Light', value: 'light' },
        { title: 'Dark', value: 'dark' },
      ]"
    />
  </Section>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import imageLazy from '../components/image-lazy.vue';
import ImageFit from '../components/image-fit.vue';
import Grid from '../components/grid.vue';
import FormButton from '../components/form/form-button.vue';
import Description from '../components/description.vue';
import FormCheckbox from '../components/form/form-checkbox.vue';
import PillDark from '../components/pill-dark.vue';
import PillSplit from '../components/pill-split.vue';
import TextIcon from '../components/text-icon.vue';
import Spinner from '../components/spinner.vue';
import ColorPreview from '../components/color-preview.vue';
import Section from '../components/section.vue';
import Hr from '../components/hr.vue';
import FormColorPicker from '../components/form/form-color-picker.vue';
import FormDropdown from '../components/form/form-dropdown.vue';
import FormSlider from '../components/form/form-slider.vue';
import SettingsGeneral from '../components/settings/settings-general.vue';
import StateDot from '../components/state-dot.vue';
import Header from '../components/header.vue';
import TextScroller from '../components/text-scroller.vue';
import FormText from '../components/form/form-text.vue';
import Modal from '../components/modal.vue';
import TransitionStaggered from '../components/transition-staggered.vue';
import { bookmarkItem } from '../minimalClass';
import BookmarksTiles from '../components/bookmarks/bookmarks-tiles.vue';
import BookmarksCards from '../components/bookmarks/bookmarks-cards.vue';
import BookmarksCardsFull from '../components/bookmarks/bookmarks-cards-full.vue';
import Bars from '../components/bars.vue';
import BookmarksList from '../components/bookmarks/bookmarks-list.vue';
import FormSwitch from '../components/form/form-switch.vue';

const imgModal = ref(false);

const list: bookmarkItem[] = [
  {
    title: 'No game no life',
    type: 'anime',
    url: 'https://myanimelist.net/anime/19815/No_Game_No_Life',
    image: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/nx19815-bIo51RMWWhLv.jpg',
    imageLarge:
      'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/nx19815-bIo51RMWWhLv.jpg',
    status: 1,
    score: 3,
    watchedEp: 3,
    totalEp: 0,
    streamUrl: 'https://www.crunchyroll.com',
    streamIcon: 'https://www.google.com/s2/favicons?domain=crunchyroll.com',
    progressEp: 4,
    progressText: '5 Days 3 Hours',
  },
  {
    title: 'No game no life',
    type: 'anime',
    url: 'https://myanimelist.net/anime/19815/No_Game_No_Life',
    image: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/nx19815-bIo51RMWWhLv.jpg',
    imageLarge:
      'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/nx19815-bIo51RMWWhLv.jpg',
    status: 2,
    watchedEp: 3,
    totalEp: 12,
  },
  {
    title: 'No game no life',
    type: 'anime',
    url: 'https://myanimelist.net/anime/19815/No_Game_No_Life',
    image: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/nx19815-bIo51RMWWhLv.jpg',
    imageLarge:
      'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/nx19815-bIo51RMWWhLv.jpg',
    status: 3,
    watchedEp: 3,
    totalEp: 12,
    streamUrl: 'https://www.crunchyroll.com',
    streamIcon: 'https://www.google.com/s2/favicons?domain=crunchyroll.com',
    progressEp: 4,
    progressText: '5 Days 3 Hours',
  },
  {
    title: 'No game no life',
    type: 'anime',
    url: 'https://myanimelist.net/anime/19815/No_Game_No_Life',
    image: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/nx19815-bIo51RMWWhLv.jpg',
    imageLarge:
      'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/nx19815-bIo51RMWWhLv.jpg',
    status: 4,
    score: 3,
    watchedEp: 3,
    totalEp: 12,
    progressEp: 4,
    progressText: '5 Days 3 Hours',
  },
];
</script>

<style lang="less" scoped>
.transitionTest {
  width: 100px;
  height: 100px;
  background-color: red;
}
</style>
