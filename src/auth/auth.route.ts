/* eslint-disable @typescript-eslint/no-explicit-any */
import { FastifyPluginAsync } from 'fastify';
import fastifyPassport from 'fastify-passport';
import { Profile, Strategy as FacebookStrategy } from 'passport-facebook';
import { FacebookAppId, FacebookAppSecret } from '../config';

const auth: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastifyPassport.use(
    new FacebookStrategy(
      {
        clientID: FacebookAppId,
        clientSecret: FacebookAppSecret,
        callbackURL: '/auth/redirect/facebook',
        authType: 'reauthenticate',
        profileFields: ['id', 'emails', 'name', 'displayName'],
      },
      async (
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        cb: (error: any, user?: any, info?: any) => void
      ) => {
        const user = await fastify.userService.userByfbAppScopeId(
          profile.id,
          true
        );
        // In this example, the user's Facebook profile is supplied as the user
        // record.  In a production-quality application, the Facebook profile should
        // be associated with a user record in the application's database, which
        // allows for account linking and authentication with other identity
        // providers.
        return cb(null, { id: user.id });
      }
    )
  );
  fastifyPassport.registerUserSerializer(
    async (user: { id: string }) => user.id
  );
  fastifyPassport.registerUserDeserializer(async ({ id }: { id: string }) => {
    return fastify.userService.findById(id);
  });
  fastify.get(
    '/auth/facebook',
    fastifyPassport.authenticate('facebook', {
      scope: ['email'],
    })
  );
  fastify.get(
    '/auth/redirect/facebook',
    {
      preValidation: fastifyPassport.authenticate('facebook', {
        successRedirect: '/',
        failureRedirect: '/bummer-dude',
        scope: ['email'],
      }),
    },
    (request, reply) => {
      reply.redirect('/');
    }
  );
};

export default auth;
