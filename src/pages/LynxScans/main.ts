import { getInter } from '../ZeroScans/main';
import { pageInterface } from '../pageInterface';

const clone = getInter();

clone.name = 'LynxScans';
clone.domain = 'https://lynxscans.com';

export const LynxScans: pageInterface = clone;
