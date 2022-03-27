import { request } from 'undici';
import fp from 'fastify-plugin';
import { FacebookPageToken } from '../config';

const SEND_MESSENGE_ENDPOINT = 'https://graph.facebook.com/v13.0/me/messages';
const TOKEN = FacebookPageToken;

class MessengerClient {
  private get endpoint() {
    return `${SEND_MESSENGE_ENDPOINT}?access_token=${TOKEN}`;
  }
  async sendMessage(options: { recipient: string; message: string }) {
    const { recipient, message } = options;
    const reqBody = {
      recipient: {
        id: recipient,
      },
      message: {
        text: message,
      },
    };
    const { body } = await request(this.endpoint, {
      body: JSON.stringify(reqBody),
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
    });

    return await body.json();
  }
}

// The use of fastify-plugin is required to be able
// to export the decorators to the outer scope
export default fp(async (fastify, opts) => {
  fastify.decorate('messengerClient', new MessengerClient());
});

// When using .decorate you have to specify added properties for Typescript
declare module 'fastify' {
  export interface FastifyInstance {
    messengerClient: MessengerClient;
  }
}
