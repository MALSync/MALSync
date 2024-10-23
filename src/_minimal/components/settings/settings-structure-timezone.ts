import moment from 'moment-timezone';
import { ConfObj } from '../../../_provider/definitions';
import SettingsSelectTimezone from './settings-select-timezone.vue';

const getOptions = () => {
  const options = moment.tz.names();
  return options.map(option => ({
    title: option,
    value: option,
  }));
};

export const timezone: ConfObj[] = [
  {
    key: 'timezone',
    title: () => api.storage.lang('settings_timezone'),
    props: () => ({
      option: 'timezone',
      props: {
        options: getOptions(),
      },
    }),
    component: SettingsSelectTimezone,
  },
];
