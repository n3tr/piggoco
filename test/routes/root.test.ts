import { FastifyInstance } from 'fastify';
import { build } from '../helper';

describe('root', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await build();
  });

  afterEach(() => {
    app?.close();
  });

  it('default root route', async () => {
    const res = await app.inject({
      url: '/',
    });
    expect(JSON.parse(res.payload)).toEqual({ root: true });
  });
});
