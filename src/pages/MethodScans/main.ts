import { getInter } from '../ZeroScans/main';
import { pageInterface } from '../pageInterface';

const clone = getInter();

clone.name = 'MethodScans';
clone.domain = 'https://methodscans.com';

export const MethodScans: pageInterface = clone;
