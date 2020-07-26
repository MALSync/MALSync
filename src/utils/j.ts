import * as DOMPurify from 'dompurify';

export const $ = jQuery;

export function html(html) {
  return DOMPurify.sanitize(html, { SAFE_FOR_JQUERY: true });
}
