import DOMPurify from 'dompurify';

export const $ = jQuery;

export function html(htmlContent) {
  return DOMPurify.sanitize(htmlContent, {
    ALLOW_UNKNOWN_PROTOCOLS: true,
    ADD_ATTR: ['target'],
  });
}
