<template>
  <div class="content">
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
        style="width: 600px; height: 300px"
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
    <Section>
      <PillDark>5 Days 3 Hours</PillDark>
      <PillSplit>
        <template #left><TextIcon icon="star">10</TextIcon></template>
        <template #right>
          <TextIcon src="https://www.google.com/s2/favicons?domain=crunchyroll.com">4</TextIcon>
        </template>
      </PillSplit>
    </Section>
    <Spinner />
    <Section>
      <ColorPreview />
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
