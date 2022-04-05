// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createSignature } = require('../dist/utils/verify-messenger-signature');

const signature = createSignature(
  //   process.env.FACEBOOK_PAGE_TOKEN,
  '676423063564656|s8DeUQVS_rVbHgyHxK5UDXULrvQ',
  process.env.FACEBOOK_APP_SECRET
);

console.log(signature);
