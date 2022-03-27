type Result = {
  total: number;
  title: string;
  tags: string[];
  category?: string;
};
export function extractMessage(message: string): Result {
  const components = message.trim().split(' ');

  if (components.length === 0) {
    throw new Error('message is empty');
  }

  const total = Number(components[0]);
  if (isNaN(total)) {
    throw new Error('total need to be a number');
  }

  if (components.length === 1) {
    return {
      total,
      title: 'Untitled',
      tags: [],
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
    total,
    category,
    title,
    tags,
  };
}
