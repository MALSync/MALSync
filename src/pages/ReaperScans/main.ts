import { getInter } from '../ZeroScans/main';
import { pageInterface } from '../pageInterface';

const clone = getInter();

clone.name = 'ReaperScans';
clone.domain = 'https://reaperscans.com';

export const ReaperScans: pageInterface = clone;
