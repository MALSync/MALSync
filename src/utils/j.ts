import * as DOMPurify from 'dompurify';

export const $ = jQuery;

export function html(htmlContent) {
  return DOMPurify.sanitize(htmlContent, {
    SAFE_FOR_JQUERY: true,
    ALLOW_UNKNOWN_PROTOCOLS: true,
    ADD_ATTR: ['target'],
  });
}
