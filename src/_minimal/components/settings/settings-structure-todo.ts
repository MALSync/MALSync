import { ConfObj } from '../../../_provider/definitions';
import SettingsGeneral from './settings-general.vue';
import SettingsProgressDropdown from './settings-progress-dropdown.vue';
import SettingsGroup from './settings-group.vue';
import SettingsClearTags from './settings-clear-tags.vue';

function startProgressSync() {
  if (api.type === 'webextension') {
    const inter = parseInt(api.settings.get('progressInterval'));
    if (!inter) return;
    con.log('Trigger Progress update');
    chrome.alarms.create('progressSync', {
      periodInMinutes: inter,
      when: Date.now() + 1000,
    });
  }
}

export const todo: ConfObj[] = [
  {
    key: 'correctionShort',
    title: () => api.storage.lang('settings_Shortcuts_Correction'),
    props: {
      component: 'shortcut',
      option: 'correctionShort',
    },
    component: SettingsGeneral,
  },
  {
    key: 'syncShort',
    title: () => api.storage.lang('settings_Shortcuts_Sync'),
    props: {
      component: 'shortcut',
      option: 'syncShort',
    },
    component: SettingsGeneral,
  },
  {
    key: 'malThumbnail',
    title: () => api.storage.lang('settings_Thumbnails'),
    props: () => ({
      component: 'dropdown',
      tooltip: api.storage.lang('settings_Thumbnails_text'),
      option: 'malThumbnail',
      props: {
        options: [
          { title: api.storage.lang('settings_Thumbnails_Large'), value: '144' },
          { title: api.storage.lang('settings_Thumbnails_Medium'), value: '100' },
          { title: api.storage.lang('settings_Thumbnails_Small'), value: '60' },
          { title: api.storage.lang('settings_Thumbnails_Default'), value: '0' },
        ],
      },
    }),
    component: SettingsGeneral,
  },
  {
    key: 'friendScore',
    title: () => api.storage.lang('settings_FriendScore'),
    props: {
      component: 'checkbox',
      option: 'friendScore',
    },
    component: SettingsGeneral,
  },
  {
    key: 'anilistUpdateUi',
    title: () => api.storage.lang('settings_anilist_update_ui'),
    props: {
      component: 'checkbox',
      option: 'anilistUpdateUi',
    },
    component: SettingsGeneral,
  },
  {
    key: 'epPredictions',
    title: () => api.storage.lang('settings_epPredictions'),
    props: {
      component: 'checkbox',
      option: 'epPredictions',
    },
    component: SettingsGeneral,
  },
  {
    key: 'malTags',
    title: () => api.storage.lang('settings_malTags'),
    props: () => ({
      component: 'checkbox',
      tooltip: api.storage.lang('settings_malTags_text'),
      option: 'malTags',
    }),
    component: SettingsGeneral,
  },
  {
    key: 'malContinue',
    title: () => api.storage.lang('settings_malContinue'),
    props: {
      component: 'checkbox',
      option: 'malContinue',
    },
    component: SettingsGeneral,
  },
  {
    key: 'malResume',
    title: () => api.storage.lang('settings_malResume'),
    props: {
      component: 'checkbox',
      option: 'malResume',
    },
    component: SettingsGeneral,
  },
  {
    key: 'usedPage',
    title: () => api.storage.lang('settings_usedPage'),
    props: {
      component: 'checkbox',
      option: 'usedPage',
    },
    component: SettingsGeneral,
  },

  {
    key: 'minimalWindow',
    title: () => api.storage.lang('settings_miniMAL_window'),
    system: 'webextension',
    props: {
      component: 'checkbox',
      option: 'minimalWindow',
    },
    component: SettingsGeneral,
  },
  {
    key: 'floatButtonStealth',
    title: () => api.storage.lang('settings_miniMAL_floatButtonStealth'),
    props: {
      component: 'checkbox',
      option: 'floatButtonStealth',
    },
    component: SettingsGeneral,
  },
  {
    key: 'minimizeBigPopup',
    title: () => api.storage.lang('settings_miniMAL_minimizeBigPopup'),
    props: {
      component: 'checkbox',
      option: 'minimizeBigPopup',
    },
    component: SettingsGeneral,
  },
  {
    key: 'floatButtonCorrection',
    title: () => api.storage.lang('settings_miniMAL_floatButtonCorrection'),
    props: {
      component: 'checkbox',
      option: 'floatButtonCorrection',
    },
    component: SettingsGeneral,
  },
  {
    key: 'floatButtonHide',
    title: () => api.storage.lang('settings_miniMAL_floatButtonHide'),
    props: {
      component: 'checkbox',
      option: 'floatButtonHide',
    },
    component: SettingsGeneral,
  },
  {
    key: 'autoCloseMinimal',
    title: () => api.storage.lang('settings_miniMAL_autoCloseMinimal'),
    system: 'userscript',
    props: {
      component: 'checkbox',
      option: 'autoCloseMinimal',
    },
    component: SettingsGeneral,
  },
  {
    key: 'posLeft',
    title: () => api.storage.lang('settings_miniMAL_Display'),
    props: () => ({
      component: 'dropdown',
      option: 'posLeft',
      props: {
        options: [
          { title: api.storage.lang('settings_miniMAL_Display_Left'), value: 'left' },
          { title: api.storage.lang('settings_miniMAL_Display_Center'), value: 'center' },
          { title: api.storage.lang('settings_miniMAL_Display_Right'), value: 'right' },
        ].filter(el => !(el.value === 'center' && api.type !== 'webextension')),
      },
    }),
    component: SettingsGeneral,
  },
  {
    key: 'miniMalHeight',
    title: () => api.storage.lang('settings_miniMAL_Height'),
    props: {
      component: 'input',
      option: 'miniMalHeight',
      props: {
        validation: (val: string) => {
          return /^\d+(%|px)$/i.test(val);
        },
      },
    },
    component: SettingsGeneral,
  },
  {
    key: 'miniMalWidth',
    title: () => api.storage.lang('settings_miniMAL_Width'),
    props: {
      component: 'input',
      option: 'miniMalWidth',
      props: {
        validation: (val: string) => {
          return /^\d+(%|px)$/i.test(val);
        },
      },
    },
    component: SettingsGeneral,
  },
  {
    key: 'autofull',
    title: () => api.storage.lang('settings_Video_Fullscreen'),
    props: {
      component: 'checkbox',
      option: 'autofull',
    },
    component: SettingsGeneral,
  },
  {
    key: 'autoresume',
    title: () => api.storage.lang('settings_Video_Resume'),
    props: {
      component: 'checkbox',
      option: 'autoresume',
    },
    component: SettingsGeneral,
  },
  {
    key: 'autoNextEp',
    title: () => api.storage.lang('settings_autoNextEp'),
    props: {
      component: 'checkbox',
      option: 'autoNextEp',
    },
    component: SettingsGeneral,
  },
  {
    key: 'nextEpShort',
    title: () => api.storage.lang('settings_Shortcuts_Next_Episode'),
    system: 'webextension',
    props: {
      component: 'shortcut',
      option: 'nextEpShort',
    },
    component: SettingsGeneral,
  },
  {
    key: 'introSkipFwd',
    title: () => api.storage.lang('settings_Shortcuts_Skip_Forward'),
    system: 'webextension',
    props: {
      component: 'shortcut',
      option: 'introSkipFwd',
    },
    component: SettingsGeneral,
  },
  {
    key: 'introSkipBwd',
    title: () => api.storage.lang('settings_Shortcuts_Skip_Backward'),
    system: 'webextension',
    props: {
      component: 'shortcut',
      option: 'introSkipBwd',
    },
    component: SettingsGeneral,
  },

  {
    key: 'introSkip',
    title: () => api.storage.lang('settings_introSkip', [api.settings.get('introSkip')]),
    system: 'webextension',
    props: {
      component: 'input',
      option: 'introSkip',
      props: {
        validation: value => Boolean(Number(value) > 4),
      },
    },
    component: SettingsGeneral,
  },
  {
    key: 'progressInterval',
    title: () => api.storage.lang('settings_Interval'),
    change: () => startProgressSync(),
    props: () => ({
      component: 'dropdown',
      option: 'progressInterval',
      props: {
        options: [
          { title: api.storage.lang('settings_Interval_Off'), value: '0' },
          { title: '30min', value: '30' },
          { title: '1h', value: '60' },
          { title: '2h', value: '120' },
          { title: '4h', value: '240' },
          { title: '12h', value: '720' },
          { title: '24h', value: '1440' },
        ],
      },
    }),
    component: SettingsGeneral,
  },
  {
    key: 'progressIntervalDefaultAnime',
    title: () => api.storage.lang('settings_Interval_Default_Anime'),
    change: () => startProgressSync(),
    props: {
      component: 'dropdown',
      option: 'progressIntervalDefaultAnime',
      type: 'anime',
    },
    component: SettingsProgressDropdown,
  },
  {
    key: 'progressIntervalDefaultManga',
    title: () => api.storage.lang('settings_Interval_Default_Manga'),
    change: () => startProgressSync(),
    props: {
      component: 'dropdown',
      option: 'progressIntervalDefaultManga',
      type: 'manga',
    },
    component: SettingsProgressDropdown,
  },
  {
    key: 'progressNotificationsAnime',
    title: () => `${api.storage.lang('settings_Notifications')} (${api.storage.lang('Anime')})`,
    props: {
      component: 'checkbox',
      option: 'progressNotificationsAnime',
    },
    component: SettingsGeneral,
  },
  {
    key: 'progressNotificationsManga',
    title: () => `${api.storage.lang('settings_Notifications')} (${api.storage.lang('Manga')})`,
    props: {
      component: 'checkbox',
      option: 'progressNotificationsManga',
    },
    component: SettingsGeneral,
  },
  {
    key: 'loadPTWForProgress',
    title: () => api.storage.lang('settings_loadPTWForProgress'),
    props: {
      component: 'checkbox',
      option: 'loadPTWForProgress',
    },
    component: SettingsGeneral,
  },
  {
    key: 'rpc',
    title: () => api.storage.lang('settings_enabled'),
    props: {
      component: 'checkbox',
      option: 'rpc',
    },
    component: SettingsGeneral,
  },
  {
    key: 'presenceLargeImage',
    title: () => api.storage.lang('settings_presence_largeimage'),
    props: () => ({
      component: 'dropdown',
      option: 'presenceLargeImage',
      props: {
        options: [
          { title: api.storage.lang('settings_presence_largeimage_cover'), value: 'cover' },
          { title: api.storage.lang('settings_presence_largeimage_website'), value: 'website' },
          { title: api.storage.lang('settings_presence_largeimage_malsync'), value: 'malsync' },
        ],
      },
    }),
    component: SettingsGeneral,
  },
  {
    key: 'presenceShowMalsync',
    title: () => api.storage.lang('settings_presenceShowMalsync'),
    props: {
      component: 'checkbox',
      option: 'presenceShowMalsync',
    },
    component: SettingsGeneral,
  },
  {
    key: 'presenceShowButtons',
    title: () => api.storage.lang('settings_presenceShowButtons'),
    props: {
      component: 'checkbox',
      option: 'presenceShowButtons',
    },
    component: SettingsGeneral,
  },
  {
    key: 'forceEn',
    title: 'Force english',
    props: {
      component: 'checkbox',
      option: 'forceEn',
    },
    component: SettingsGeneral,
  },
  {
    key: 'highlightAllEp',
    title: () => api.storage.lang('settings_highlightAllEp'),
    props: () => ({
      component: 'checkbox',
      tooltip: api.storage.lang('settings_highlightAllEp_Text'),
      option: 'highlightAllEp',
    }),
    component: SettingsGeneral,
  },
  {
    key: 'checkForFiller',
    title: () => api.storage.lang('settings_filler'),
    system: 'webextension',
    props: () => ({
      component: 'checkbox',
      tooltip: api.storage.lang('settings_filler_text'),
      option: 'checkForFiller',
    }),
    component: SettingsGeneral,
  },
  {
    key: 'crashReport',
    title: () => api.storage.lang('settings_crash_report'),
    system: 'webextension',
    props: () => ({
      component: 'checkbox',
      tooltip: api.storage.lang('settings_crash_report_text'),
      option: 'crashReport',
    }),
    component: SettingsGeneral,
  },
  {
    key: 'cleanTagsUi',
    title: () => api.storage.lang('settings_clean_tags_button'),
    props: () => ({
      type: 'button',
      icon: '',
      props: {
        color: 'primary',
        title: api.storage.lang('settings_clean_tags_button'),
      },
    }),
    component: SettingsGroup,
    children: [
      {
        key: 'cleanTags',
        title: () => api.storage.lang('settings_clean_tags_button'),
        component: SettingsClearTags,
      },
    ],
  },
  {
    key: 'clearCache',
    title: () => api.storage.lang('settings_ClearCache'),
    props: () => ({
      component: 'button',
      props: {
        color: 'primary',
        title: api.storage.lang('settings_ClearCache'),
        click: () => utils.clearCache(),
      },
    }),
    component: SettingsGeneral,
  },
];
