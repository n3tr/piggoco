import { FastifyPluginAsync } from 'fastify';
import { FaebookAppSecret, FacebookAppWebhookSecret } from '../config';
import { extractMessage } from '../utils/extract-message';
import { verifyMessengerSignature } from '../utils/verify-messenger-signature';

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
    postback?: {
      title: string;
      payload: string;
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
  }>('/webhook/messenger', async function (request, reply) {
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
    Header: { 'x-hub-signature': string };
  }>(
    '/webhook/messenger',
    {
      config: {
        rawBody: true,
      },
    },
    async (request, reply) => {
      verifyMessengerSignature(
        request.rawBody,
        request.headers['x-hub-signature'] as string,
        FaebookAppSecret
      );
      reply.status(200).send('EVENT_RECEIVED');

      const { body } = request;
      const { object } = body;
      if (object === 'page') {
        const messages = body.entry.flatMap((entry) => {
          return entry.messaging;
        });

        for (const message of messages) {
          if (message.postback && message.postback.title === 'Delete') {
            const payload = JSON.parse(message.postback.payload) as {
              transactionId: string;
            };
            await fastify.walletService.deleteTransaction(
              payload.transactionId
            );
            fastify.messengerService.sendMessage({
              recipient: message.sender.id,
              message: { text: 'Deleted!' },
            });
            continue;
          }
          if (!message.message) {
            continue;
          }

          try {
            const extractedMessage = extractMessage(message.message.text);

            const user = await fastify.userService.userByfbPsId(
              message.sender.id,
              true
            );
            const transaction = await fastify.walletService.addTransaction({
              ...extractedMessage,
              userId: user.id,
            });

            await fastify.messengerService.sendRecieptMessage(
              message.sender.id,
              transaction
            );
          } catch (e) {
            fastify.log.error(e.message, e);
            fastify.messengerService.sendMessage({
              recipient: message.sender.id,
              message: { text: e.message },
            });
          }
        }
      }
    }
  );
};

export default root;
