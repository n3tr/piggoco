import { TransactionType } from '../../src/types';
import { extractMessage } from '../../src/utils/extract-message';

test('support works standalone', async () => {
  expect(extractMessage('120.25 fairprice extra @f #grab')).toEqual({
    amount: 120.25,
    title: 'fairprice extra',
    category: '@f',
    tags: ['#grab'],
    type: TransactionType.EXPENSE,
  });

  expect(extractMessage('120.25 @f #grab #food')).toEqual({
    amount: 120.25,
    title: 'Untitled',
    category: '@f',
    tags: ['#grab', '#food'],
    type: TransactionType.EXPENSE,
  });
});
