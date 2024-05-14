module.exports = {
  getVirtualScript(name, code) {
    const base64 = Buffer.from(code).toString('base64');
	  return `${name}.ts!=!data:text/javascript;base64,${base64}`;
  },
};
