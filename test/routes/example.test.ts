import { FastifyInstance } from 'fastify';
import { build } from '../helper';

describe('example', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await build();
  });

  afterEach(() => {
    app?.close();
  });

  test('example is loaded', async () => {
    const res = await app.inject({
      url: '/example',
    });

    expect(res.payload).toEqual('this is an example');
  });
});
