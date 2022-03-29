// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

import { join } from 'path';
import AutoLoad, { AutoloadPluginOptions } from 'fastify-autoload';
import { FastifyPluginAsync } from 'fastify';

import messengerPlugin from './messenger/messenger.plugin';
import messengerRoute from './messenger/messenger.route';
import walletPlugin from './wallet/wallet.plugin';
import userPlugin from './user/user.plugin';
import path = require('path');

export type AppOptions = {
  // Place your custom options for app below here.
} & Partial<AutoloadPluginOptions>;

const app: FastifyPluginAsync<AppOptions> = async (
  fastify,
  opts
): Promise<void> => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  fastify.register(require('fastify-static'), {
    root: path.join(__dirname, '..', 'public'),
    prefix: '/public/', // optional: default '/'
  });

  fastify.get('/privacy', (_, reply) => {
    // @ts-expect-error sendFile is not typed
    reply.sendFile('privacy.html');
  });
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  fastify.register(require('fastify-raw-body'), {
    field: 'rawBody', // change the default request.rawBody property name
    global: true, // add the rawBody to every request. **Default true**
    encoding: false, // set it to false to set rawBody as a Buffer **Default utf8**
    runFirst: true, // get the body before any preParsing hook change/uncompress it. **Default false**
    routes: [], // array of routes, **`global`** will be ignored, wildcard routes not supported
  });

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'plugins'),
    options: opts,
  });

  fastify.get('/', (_, reply) => {
    reply.send({ status: 'up' });
  });

  // This loads all plugins defined in routes
  // define your routes in one of these
  // Messenger
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  fastify.register(userPlugin);
  fastify.register(walletPlugin);
  fastify.register(messengerPlugin);
  fastify.register(messengerRoute, { prefix: '/api' });
};

export default app;
export { app };
