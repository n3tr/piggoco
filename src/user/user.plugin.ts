// The use of fastify-plugin is required to be able

import fp from 'fastify-plugin';
import { UserService } from './user.service';

// to export the decorators to the outer scope
export default fp(async (fastify) => {
  fastify.decorate(
    'userService',
    new UserService({
      prismaClient: fastify.prisma,
      fbClient: fastify.fbClient,
    }),
    ['prisma', 'fbClient']
  );
});

// When using .decorate you have to specify added properties for Typescript
declare module 'fastify' {
  export interface FastifyInstance {
    userService: UserService;
  }
}
