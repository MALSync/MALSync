import { getInter } from '../ZeroScans/main';
import { pageInterface } from '../pageInterface';

const clone = getInter();

clone.name = 'NonamesScans';
clone.domain = 'https://the-nonames.com';

export const NonamesScans: pageInterface = clone;
