import { getInter } from '../ZeroScans/main';
import { pageInterface } from '../pageInterface';

const clone = getInter();

clone.name = 'SecretScans';
clone.domain = 'https://secretscans.co';

export const SecretScans: pageInterface = clone;
