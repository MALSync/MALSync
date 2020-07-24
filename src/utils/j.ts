import * as DOMPurify from 'dompurify';

export const $ = jQuery;

export function safeAfter(selector, html) {
  // eslint-disable-next-line jquery-unsafe-malsync/no-after
  return selector.after(cleanHtml(html));
}

export function safeAppend(selector, html) {
  // eslint-disable-next-line jquery-unsafe-malsync/no-append
  return selector.append(cleanHtml(html));
}

export function safeAppendTo(htmlSelector, selector) {
  const html = htmlSelector[0].outerHTML;
  // eslint-disable-next-line jquery-unsafe-malsync/no-appendTo
  return $(cleanHtml(html)).appendTo(selector);
}

export function safeBefore(selector, html) {
  // eslint-disable-next-line jquery-unsafe-malsync/no-before
  return selector.before(cleanHtml(html));
}

export function safeHtml(selector, html) {
  // eslint-disable-next-line jquery-unsafe-malsync/no-html
  return selector.html(cleanHtml(html));
}

export function safeInsertAfter(selector, html) {
  // eslint-disable-next-line jquery-unsafe-malsync/no-insertAfter
  return selector.insertAfter(cleanHtml(html));
}

export function safeInsertBefore(selector, html) {
  // eslint-disable-next-line jquery-unsafe-malsync/no-insertBefore
  return selector.insertBefore(cleanHtml(html));
}

export function safePrepend(selector, html) {
  // eslint-disable-next-line
  return selector.prepend(cleanHtml(html));
}

export function safePrependTo(htmlSelector, selector) {
  const html = htmlSelector[0].outerHTML;
  // eslint-disable-next-line
  return $(cleanHtml(html)).prependTo(selector);
}

function cleanHtml(html) {
  return DOMPurify.sanitize(html, { SAFE_FOR_JQUERY: true });
}
