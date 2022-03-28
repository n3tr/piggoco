import { TransactionType } from '../types';

type ExtractResult = {
  amount: number;
  title: string;
  tags: string[];
  category?: string;
  type: TransactionType;
};
export function extractMessage(message: string): ExtractResult {
  const components = message.trim().split(' ');

  if (components.length === 0) {
    throw new Error('message is empty');
  }

  const amountString = components[0];
  const amount = Number(amountString);
  if (isNaN(amount)) {
    throw new Error('total need to be a number');
  }

  let type = TransactionType.EXPENSE;
  if (amountString.startsWith('+')) {
    type = TransactionType.INCOME;
  }

  if (components.length === 1) {
    return {
      amount: Math.abs(amount),
      title: 'Untitled',
      tags: [],
      type,
    };
  }

  let idx = 1;
  const textComponents = [];

  const tags = [];
  let category: string | undefined = undefined;

  // Extract title
  while (idx < components.length) {
    const comp = components[idx].trim();
    if (comp.startsWith('@') || comp.startsWith('#')) {
      break;
    }
    textComponents.push(comp);

    idx++;
  }

  // Extract Category and Text
  for (; idx < components.length; idx++) {
    const comp = components[idx].trim();

    if (comp.length === 1) {
      continue;
    }

    if (comp.startsWith('@') && !category) {
      category = comp;
      continue;
    }
    if (comp.startsWith('#')) {
      tags.push(comp);
    }
  }

  const title =
    textComponents.length > 0 ? textComponents.join(' ') : 'Untitled';

  return {
    amount,
    category,
    title,
    tags,
    type,
  };
}
