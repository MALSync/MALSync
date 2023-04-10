import { Review } from '../../../_provider/metaOverviewAbstract';

export async function reviewMeta(malUrl: string): Promise<Review[]> {
  const res: Review[] = [];
  const response = await api.request.xhr('GET', `${malUrl}/_/reviews`);

  try {
    const reviewSection = response.responseText
      .split('Reviews</h2>')[1]
      .split('<h2>')[0]
      .split('class="mt4"')[0];

    j.$.each(j.$(j.$.parseHTML(reviewSection)).filter('.review-element'), (index, value) => {
      const block = j.$(value);

      const userHref = block.find('.username a').attr('href') || '';
      const userImage = block.find('a > img').first().attr('data-src') || '';

      const username = block.find('.username a').text().trim();

      const reactionJson = block.attr('data-reactions');

      const reactions = reactionJson ? JSON.parse(reactionJson) : { num: 0 };

      const rPeople = reactions.num;

      const rDate = block.find('.update_at').text().trim();

      const rRating = Number(block.find('.rating .num').text());

      const moreText = block.find('.text .js-hidden').text().trim();

      const textBlock = block.find('.text');

      textBlock.find('.js-hidden').remove();
      textBlock.find('.js-visible').remove();
      const topText = textBlock.text().trim();
      const rText = topText + moreText;

      res.push({
        user: {
          name: username,
          image: userImage,
          href: userHref,
        },
        body: {
          people: rPeople,
          date: rDate,
          rating: rRating,
          text: rText,
        },
      });
    });
  } catch (e) {
    con.m('review').error(e);
  }

  return res;
}
