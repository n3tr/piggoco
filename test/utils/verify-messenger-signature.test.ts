import { verifyMessengerSignature } from '../../src/utils/verify-messenger-signature';

test('Verify Facebook Messenger Signature', () => {
  const match = verifyMessengerSignature(
    Buffer.from(
      JSON.stringify({
        object: 'page',
        entry: [
          {
            time: 1648483032127,
            id: '0',
            messaging: [
              {
                sender: { id: '12334' },
                recipient: { id: '23245' },
                timestamp: '1527459824',
                message: { mid: 'test_message_id', text: 'test_message' },
              },
            ],
          },
        ],
      }),
      'utf-8'
    ),

    'sha1=a16a8279e48100265b687cfb8eeb3a1963c46165',
    'fbe65d39c6259ba185b71b005fe802e5'
  );

  expect(match).toEqual(true);
});
