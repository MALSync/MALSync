import { getInter } from '../ZeroScans/main';
import { pageInterface } from '../pageInterface';

const clone = getInter();

clone.name = 'KrakenScans';
clone.domain = 'https://krakenscans.com';

export const KrakenScans: pageInterface = clone;
