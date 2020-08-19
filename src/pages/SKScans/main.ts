import { getInter } from '../ZeroScans/main';
import { pageInterface } from '../pageInterface';

const clone = getInter();

clone.name = 'SKScans';
clone.domain = 'https://skscans.com';

export const SKScans: pageInterface = clone;
