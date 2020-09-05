import { getInter } from '../ZeroScans/main';
import { pageInterface } from '../pageInterface';

const clone = getInter();

clone.name = 'KKJScans';
clone.domain = 'https://kkjscans.co';

export const KKJScans: pageInterface = clone;
