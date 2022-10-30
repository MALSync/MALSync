import { pageInterface } from '../pageInterface';
import { getInter } from '../AsuraScans/main';

const clone = getInter();

clone.name = 'VoidScans';
clone.domain = 'https://void-scans.com';

export const VoidScans: pageInterface = clone;
