export type Recommendation = {
  entry: {
    title: string;
    url: string;
    image: string;
  };
  user: {
    name: string;
    href: string;
  };
  body: {
    text: string;
    more: {
      url: string;
      number: number;
    };
  };
};

export async function recommendationsMeta(malUrl: string): Promise<Recommendation[]> {
  const res: Recommendation[] = [];
  const response = await api.request.xhr('GET', `${malUrl}/userrecs`);

  try {
    const recommendationsBlock = response.responseText
      .split('Make a recommendation</a>')[1]
      .split('</h2>')[1]
      .split('<div class="mauto')[0];

    j.$.each(j.$(j.$.parseHTML(recommendationsBlock)).filter('.borderClass'), (index, value) => {
      const imageBlock = j.$(value).find('.picSurround');

      const titleHref = imageBlock.find('a').attr('href');

      const titleName = imageBlock.find('a > img').first().attr('alt');

      let imageUrl = imageBlock.find('a > img').first().attr('data-src');
      if (imageUrl) imageUrl = imageUrl.replace(/\/r\/\d*x\d*/g, '');

      const username = j.$(value).find('.detail-user-recs-text').next().find('a').last().text();

      const userHref = utils.absoluteLink(
        j.$(value).find('.detail-user-recs-text').next().find('a').last().attr('href'),
        'https://myanimelist.net',
      );

      const text = j
        .$(value)
        .find('.detail-user-recs-text')
        .first()
        .text()
        .replace('read more', '')
        .trim();

      const moreUrl = utils.absoluteLink(
        j.$(value).find('[title="Permalink"]').attr('href'),
        'https://myanimelist.net',
      );

      const moreNumber = Number(
        j.$(value).find('.js-similar-recommendations-button strong').text() || 0,
      );

      res.push({
        entry: {
          title: titleName || '',
          url: titleHref || '',
          image: imageUrl || '',
        },
        user: {
          name: username,
          href: userHref,
        },
        body: {
          text,
          more: {
            url: moreUrl,
            number: moreNumber,
          },
        },
      });
    });
  } catch (e) {
    con.m('review').error(e);
  }

  return res;
}
