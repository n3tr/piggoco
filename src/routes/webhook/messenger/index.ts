import { FastifyPluginAsync } from 'fastify';
import { FacebookAppWebhookSecret } from '../../../config';

const VERIFY_TOKEN = FacebookAppWebhookSecret;

interface IQuerystring {
  'hub.mode': string;
  'hub.challenge': string;
  'hub.verify_token': string;
}

type IMessengerComingWebhookEntry = {
  time: string;
  id: string;
  messaging: Array<{
    sender: {
      id: string;
    };
    recipient: {
      id: string;
    };
    timestamp: string;
    message?: {
      mid: string;
      text: string;
    };
    read?: {
      watermark: string;
    };
  }>;
};

type IMessengerComingWebhook = {
  object: string;
  entry: IMessengerComingWebhookEntry[];
};

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get<{
    Querystring: IQuerystring;
  }>('/', async function (request, reply) {
    console.log(request.query);
    const mode = request.query['hub.mode'];
    const challenge = request.query['hub.challenge'];
    const token = request.query['hub.verify_token'];

    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      reply.status(200).send(challenge);
      return;
    }

    reply.status(403).send('Forbidden');
  });

  fastify.post<{
    Body: IMessengerComingWebhook;
  }>('/', async (request, reply) => {
    console.log(fastify.messengerClient);
    console.log(JSON.stringify(request.body, null, 2));
    const { body } = request;
    const { object } = body;
    if (object === 'page') {
      const messages = body.entry.flatMap((entry) => {
        return entry.messaging;
      });

      for (const message of messages) {
        if (!message.message) {
          continue;
        }
        await fastify.messengerClient.sendMessage({
          recipient: message.sender.id,
          message: message.message.text,
        });
      }
    }

    reply.status(200).send('EVENT_RECEIVED');
  });
};

export default root;
