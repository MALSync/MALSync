/* eslint-disable no-bitwise */

export const log = (function() {
  return Function.prototype.bind.call(
    console.log,
    console,
    '%cMAL-Sync-BG',
    'background-color: #2e51a2; color: white; padding: 2px 10px; border-radius: 3px;',
  );
})();

export const error = (function() {
  return Function.prototype.bind.call(
    console.error,
    console,
    '%cMAL-Sync-BG',
    'background-color: #8f0000; color: white; padding: 2px 10px; border-radius: 3px;',
  );
})();

export const info = (function() {
  return Function.prototype.bind.call(
    console.info,
    console,
    '%cMAL-Sync-BG',
    'background-color: wheat; color: black; padding: 2px 10px; border-radius: 3px;',
  );
})();

export const debug = (function() {
  return Function.prototype.bind.call(
    console.debug,
    console,
    '%cMAL-Sync-BG',
    'background-color: steelblue; color: black; padding: 2px 10px; border-radius: 3px;',
  );
})();

export const m = (name, color = '', blocks: { name: string; style: string }[] = []) => {
  let fontColor = 'white';
  if (!color) color = stringToColour(name);
  if (color[0] === '#') fontColor = getColorByBgColor(color);
  const style = `background-color: ${color}; color: ${fontColor}; padding: 2px 10px; border-radius: 3px; margin-left: -5px; border-left: 1px solid white;`;
  blocks.push({
    name,
    style,
  });

  const temp: any = {};

  temp.m = (name2, color2 = '') => {
    return m(name2, color2, [...blocks]);
  };

  const moduleText = blocks.reduce((sum, el) => `${sum}%c${el.name}`, '');
  const moduleStyle = blocks.map(el => el.style);

  temp.log = (function() {
    return Function.prototype.bind.call(
      console.log,
      console,
      `%cMB ${moduleText}`,
      'background-color: #2e51a2; color: white; padding: 2px 10px; border-radius: 3px;',
      ...moduleStyle,
    );
  })();

  temp.error = (function() {
    return Function.prototype.bind.call(
      console.error,
      console,
      `%cMB ${moduleText}`,
      'background-color: #8f0000; color: white; padding: 2px 10px; border-radius: 3px;',
      ...moduleStyle,
    );
  })();

  temp.info = (function() {
    return Function.prototype.bind.call(
      console.info,
      console,
      `%cMB ${moduleText}`,
      'background-color: wheat; color: black; padding: 2px 10px; border-radius: 3px;',
      ...moduleStyle,
    );
  })();

  temp.debug = (function() {
    return Function.prototype.bind.call(
      console.debug,
      console,
      `%cMB ${moduleText}`,
      'background-color: steelblue; color: black; padding: 2px 10px; border-radius: 3px;',
      ...moduleStyle,
    );
  })();

  return temp;
};

function stringToColour(str) {
  if (!str) return '#ffffff';
  str = String(str);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let colour = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    colour += `00${value.toString(16)}`.substr(-2);
  }
  return colour;
}

function getColorByBgColor(bgColor) {
  return parseInt(bgColor.replace('#', ''), 16) > 0xffffff / 2 ? '#000' : '#fff';
}
