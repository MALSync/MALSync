import { pageInterface } from '../pageInterface';
import { getInter } from '../RealmScans/main';

const clone = getInter();

clone.name = 'LuminousScans';
clone.domain = 'https://luminousscans.com';

export const LuminousScans: pageInterface = clone;
