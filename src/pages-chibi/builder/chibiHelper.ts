/* eslint-disable no-bitwise */
import { pages } from '../pages';

export function getVersionHashes() {
  const hashes: { [key: string]: string } = {};
  Object.keys(pages).forEach(key => {
    const pageObj = pages[key];
    const pageString = objectToString(pageObj);
    hashes[key] = createShortHash(pageString);
  });
  return hashes;
}

function objectToString(obj: any): string {
  const result = {};

  Object.keys(obj).forEach(key => {
    const value = obj[key];
    if (typeof value === 'function') {
      result[key] = value.toString();
    } else if (typeof value === 'object' && value !== null) {
      result[key] = objectToString(value);
    } else {
      result[key] = value;
    }
  });

  return JSON.stringify(result);
}

function createShortHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash &= hash;
  }

  return (hash >>> 0).toString(16).slice(-8).padStart(8, '0');
}
