// The use of fastify-plugin is required to be able

import fp from 'fastify-plugin';
import { WalletService } from './wallet.service';

// to export the decorators to the outer scope
export default fp(async (fastify) => {
  fastify.decorate(
    'walletService',
    new WalletService({ prismaClient: fastify.prisma }),
    ['prisma']
  );
});

// When using .decorate you have to specify added properties for Typescript
declare module 'fastify' {
  export interface FastifyInstance {
    walletService: WalletService;
  }
}
