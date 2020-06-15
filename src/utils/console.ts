export const log = (function() {
  return Function.prototype.bind.call(
    console.log,
    console,
    '%cMAL-Sync',
    'background-color: #2e51a2; color: white; padding: 2px 10px; border-radius: 3px;',
  );
})();

export const error = (function() {
  return Function.prototype.bind.call(
    console.error,
    console,
    '%cMAL-Sync',
    'background-color: #8f0000; color: white; padding: 2px 10px; border-radius: 3px;',
  );
})();

export const info = (function() {
  return Function.prototype.bind.call(
    console.info,
    console,
    '%cMAL-Sync',
    'background-color: wheat; color: black; padding: 2px 10px; border-radius: 3px;',
  );
})();

export const m = (name, color = '', blocks: { name: string; style: string }[] = []) => {
  if (!color) color = '#2e51a2';
  const style = `background-color: ${color}; color: white; padding: 2px 10px; border-radius: 3px; margin-left: -5px; border-left: 1px solid white;`;
  blocks.push({
    name,
    style,
  });

  const temp: any = {};

  temp.m = (name2, color2 = '') => {
    return m(name2, color2, blocks);
  };

  const moduleText = blocks.reduce((sum, el) => `${sum}%c${el.name}`, '');
  const moduleStyle = blocks.map(el => el.style);

  temp.log = (function() {
    return Function.prototype.bind.call(
      console.log,
      console,
      `%cMAL-Sync ${moduleText}`,
      'background-color: #2e51a2; color: white; padding: 2px 10px; border-radius: 3px;',
      ...moduleStyle,
    );
  })();

  temp.error = (function() {
    return Function.prototype.bind.call(
      console.error,
      console,
      `%cMAL-Sync ${moduleText}`,
      'background-color: #8f0000; color: white; padding: 2px 10px; border-radius: 3px;',
      ...moduleStyle,
    );
  })();

  temp.info = (function() {
    return Function.prototype.bind.call(
      console.info,
      console,
      `%cMAL-Sync ${moduleText}`,
      'background-color: wheat; color: black; padding: 2px 10px; border-radius: 3px;',
      ...moduleStyle,
    );
  })();

  return temp;
};
