/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable func-names */
/* eslint-disable no-bitwise */

// Declare the BACKGROUND variable that webpack injects
declare const BACKGROUND: boolean;

type ConsoleMethod = (...data: any[]) => void;

export interface ModuleLogger {
  log: ConsoleMethod;
  error: ConsoleMethod;
  info: ConsoleMethod;
  debug: ConsoleMethod;
  m: (name: string | number, color?: string) => ModuleLogger;
}

// Try to detect if we're in a background script
const isBackground = typeof BACKGROUND !== 'undefined' && BACKGROUND === true;
const defaultPrefix = isBackground ? 'MAL-Sync-BG' : 'MAL-Sync';
const modulePrefix = isBackground ? 'MB' : 'M';

export const log = (function () {
  return Function.prototype.bind.call(
    console.log,
    console,
    `%c${defaultPrefix}`,
    'background-color: #2e51a2; color: white; padding: 2px 10px; border-radius: 3px;',
  ) as ConsoleMethod;
})();

export const error: (...data: any[]) => void = (function () {
  return Function.prototype.bind.call(
    console.error,
    console,
    `%c${defaultPrefix}`,
    'background-color: #8f0000; color: white; padding: 2px 10px; border-radius: 3px;',
  ) as ConsoleMethod;
})();

export const info: (...data: any[]) => void = (function () {
  return Function.prototype.bind.call(
    console.info,
    console,
    `%c${defaultPrefix}`,
    'background-color: wheat; color: black; padding: 2px 10px; border-radius: 3px;',
  ) as ConsoleMethod;
})();

export const debug: (...data: any[]) => void = (function () {
  return Function.prototype.bind.call(
    console.debug,
    console,
    `%c${defaultPrefix}`,
    'background-color: steelblue; color: black; padding: 2px 10px; border-radius: 3px;',
  ) as ConsoleMethod;
})();

function stringToColor(str: string | number | null | undefined) {
  if (!str) return '#ffffff';
  str = String(str);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
}

function getColorByBgColor(bgColor: string) {
  return parseInt(bgColor.replace('#', ''), 16) > 0xffffff / 2 ? '#000' : '#fff';
}

/**
 * Creates a module logger with custom prefix
 */
export function m(
  name: string | number,
  color = '',
  blocks: { name: string | number; style: string }[] = [],
): ModuleLogger {
  let fontColor = 'white';
  if (!color) color = stringToColor(name);
  if (color[0] === '#') fontColor = getColorByBgColor(color);
  const style = `background-color: ${color}; color: ${fontColor}; padding: 2px 10px; border-radius: 3px; margin-left: -5px; border-left: 1px solid white;`;
  blocks.push({ name, style });

  const moduleText = blocks.reduce((sum, el) => `${sum}%c${el.name}`, '');
  const moduleStyle = blocks.map(el => el.style);

  const logger: ModuleLogger = {
    m(name2: string | number, color2 = ''): ModuleLogger {
      return m(name2, color2, [...blocks]);
    },

    log: (function () {
      return Function.prototype.bind.call(
        console.log,
        console,
        `%c${modulePrefix} ${moduleText}`,
        'background-color: #2e51a2; color: white; padding: 2px 10px; border-radius: 3px;',
        ...moduleStyle,
      ) as ConsoleMethod;
    })(),

    error: (function () {
      return Function.prototype.bind.call(
        console.error,
        console,
        `%c${modulePrefix} ${moduleText}`,
        'background-color: #8f0000; color: white; padding: 2px 10px; border-radius: 3px;',
        ...moduleStyle,
      ) as ConsoleMethod;
    })(),

    info: (function () {
      return Function.prototype.bind.call(
        console.info,
        console,
        `%c${modulePrefix} ${moduleText}`,
        'background-color: wheat; color: black; padding: 2px 10px; border-radius: 3px;',
        ...moduleStyle,
      ) as ConsoleMethod;
    })(),

    debug: (function () {
      return Function.prototype.bind.call(
        console.debug,
        console,
        `%c${modulePrefix} ${moduleText}`,
        'background-color: steelblue; color: black; padding: 2px 10px; border-radius: 3px;',
        ...moduleStyle,
      ) as ConsoleMethod;
    })(),
  };

  return logger;
}
