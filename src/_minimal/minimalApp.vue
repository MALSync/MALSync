<template>
  <div class="content">
    <Theming />
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
      <ImageFit
        style="width: 600px; height: 300px; max-width: 100%"
        src="https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/nx19815-bIo51RMWWhLv.jpg"
      />
    </Section>
    <Section>
      <Description
        >When a mysterious creature chops the moon down to a permanent crescent, the students of
        class class 3-E of Kunugigaoka Middle School find themselves confronted with an enormous
        task: task: assassinate the creature responsible for the disaster before Earth suffers a
        similar fate. However, the monster, dubbed Koro-sensei (the indestructible teacher), is able
        to fly at speeds of up to Mach 20, which he demonstrates freely, leaving any attempt to
        subdue him his extraterrestrial dust. Furthermore, the misfits of 3-E soon find that the
        strange, tentacled beast is more than just indomitable—he is the best teacher they have ever
        had! Adapted from the humorous hit manga by Yuusei Matsui, Ansatsu Kyoushitsu tells the
        story of these junior high pupils as they polish their assassination skills and grow in
        order to stand strong against the oppressive school system, their own life problems, and one
        day, Koro-sensei.[Written by MAL Rewrite]When a mysterious creature chops the moon down to a
        permanent crescent, the students of class 3-E of Kunugigaoka Middle School find themselves
        confronted with an enormous task: assassinate the creature responsible for the disaster
        before Earth suffers a similar fate. However, the monster, dubbed Koro-sensei (the
        indestructible teacher), is able to fly at speeds of up to Mach 20, which he demonstrates
        freely, leaving any attempt to subdue him in his extraterrestrial dust. Furthermore, the
        misfits of 3-E soon find that the strange, tentacled beast is more than just indomitable—he
        is the best teacher they have ever had! Adapted from the humorous hit manga by Yuusei
        Matsui, Ansatsu Kyoushitsu tells the story of these junior high pupils as they polish their
        assassination skills and grow in order to stand strong against the oppressive school system,
        their own life problems, and one Koro-sensei.[Written by MAL Rewrite]</Description
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
      <SettingsGeneral title="Sidebars [TODO]" option="themeSidebars" component="checkbox" />
      <SettingsGeneral
        v-if="option('theme') === 'custom'"
        title="Color [TODO]"
        option="themeColor"
        component="colorPicker"
      />
      <SettingsGeneral
        v-if="option('theme') === 'custom'"
        title="Background Image [TODO]"
        option="themeImage"
        component="input"
      />
      <SettingsGeneral
        v-if="option('theme') === 'custom' && option('themeImage')"
        title="Background Opacity [TODO]"
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
        >Score 8.13 Rank 379 Popularity 42 Members 1,176,966 Premiered: Winter 2015 Premiered:
        Winter 2015 Premiered: Winter 2015 Premiered: Winter 2015 Members 1,176,966 Premiered: Winter 2015 Premiered:
        Winter 2015 Premiered: Winter 2015 Premiered: Winter 2015</TextScroller
      >
    </Section>
  </div>
</template>

<script lang="ts" setup>
import imageLazy from './components/image-lazy.vue';
import ImageFit from './components/image-fit.vue';
import Grid from './components/grid.vue';
import FormButton from './components/form/form-button.vue';
import Description from './components/description.vue';
import FormCheckbox from './components/form/form-checkbox.vue';
import PillDark from './components/pill-dark.vue';
import PillSplit from './components/pill-split.vue';
import TextIcon from './components/text-icon.vue';
import Spinner from '../minimal/minimalApp/components/spinner.vue';
import ColorPreview from './components/color-preview.vue';
import Section from './components/section.vue';
import Hr from './components/hr.vue';
import FormColorPicker from './components/form/form-color-picker.vue';
import FormDropdown from './components/form/form-dropdown.vue';
import FormSlider from './components/form/form-slider.vue';
import SettingsGeneral from './components/settings/settings-general.vue';
import Theming from './components/theming.vue';
import StateDot from './components/state-dot.vue';
import Header from './components/header.vue';
import TextScroller from './components/text-scroller.vue';
import FormText from './components/form/form-text.vue';
</script>

<style lang="less">
@import './less/_main.less';
</style>

<style lang="less" scoped>
@import './less/_globals.less';
.content {
  padding: 0 @spacer;
}
</style>
