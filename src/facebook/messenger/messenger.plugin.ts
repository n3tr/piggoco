// The use of fastify-plugin is required to be able

import fp from 'fastify-plugin';
import { MessengerService } from './messenger.service';

// to export the decorators to the outer scope
export default fp(async (fastify) => {
  fastify.decorate(
    'messengerService',
    new MessengerService({ walletService: fastify.walletService }),
    ['walletService']
  );
});

// When using .decorate you have to specify added properties for Typescript
declare module 'fastify' {
  export interface FastifyInstance {
    messengerService: MessengerService;
  }
}
