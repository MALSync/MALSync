import { getInter } from '../ZeroScans/main';
import { pageInterface } from '../pageInterface';

const clone = getInter();

clone.name = 'LeviatanScans';
clone.domain = 'https://leviatanscans.com';

export const LeviatanScans: pageInterface = clone;
