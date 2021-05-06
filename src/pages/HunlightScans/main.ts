import { getInter } from '../ZeroScans/main';
import { pageInterface } from '../pageInterface';

const clone = getInter();

clone.name = 'HunlightScans';
clone.domain = 'https://hunlight-scans.info/';

export const HunlightScans: pageInterface = clone;
