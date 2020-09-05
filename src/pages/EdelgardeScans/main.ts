import { getInter } from '../ZeroScans/main';
import { pageInterface } from '../pageInterface';

const clone = getInter();

clone.name = 'EdelgardeScans';
clone.domain = 'https://edelgardescans.com';

export const EdelgardeScans: pageInterface = clone;
