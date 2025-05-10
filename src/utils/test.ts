export function getPageConfig(url, thispages) {
  for (const key in thispages) {
    const page = thispages[key];
    if (j.$.isArray(page.domain)) {
      let resPage;
      page.domain.forEach(singleDomain => {
        if (checkDomain(url, singleDomain)) {
          page.domain = singleDomain;
          resPage = page;
        }
      });
      if (resPage) return resPage;
    } else if (checkDomain(url, page.domain)) {
      return page;
    }
  }
  return null;
}

function checkDomain(url, domain) {
  const partDomain = utils.urlPart(domain, 2).replace('.com.br', '.br').split('.').slice(-2, -1)[0];
  return new RegExp(`(\\.|^|\\/)${partDomain}\\.`).test(url);
}
