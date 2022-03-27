import { extractMessage } from '../../src/utils/extract-message';

test('support works standalone', async () => {
  expect(extractMessage('120.25 fairprice extra @f #grab')).toEqual({
    total: 120.25,
    title: 'fairprice extra',
    category: '@f',
    tags: ['#grab'],
  });

  expect(extractMessage('120.25 @f #grab #food')).toEqual({
    total: 120.25,
    title: 'Untitled',
    category: '@f',
    tags: ['#grab', '#food'],
  });
});
