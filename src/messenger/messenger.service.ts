import { request } from 'undici';
import { JsonObject } from 'type-fest';
import { FacebookPageToken } from '../config';
import { extractMessage } from '../utils/extract-message';
import { WalletService } from '../wallet/wallet.service';
import { TransactionType, WalletTransaction } from '../types';
import { Category, Transaction, TransactionTag } from '@prisma/client';

const SEND_MESSENGE_ENDPOINT = 'https://graph.facebook.com/v13.0/me/messages';
const TOKEN = FacebookPageToken;

export class MessengerService {
  private walletService: WalletService;
  constructor(options: { walletService: WalletService }) {
    this.walletService = options.walletService;
  }

  private get endpoint() {
    return `${SEND_MESSENGE_ENDPOINT}?access_token=${TOKEN}`;
  }

  async sendMessage(options: { recipient: string; message: JsonObject }) {
    const { recipient, message } = options;
    const reqBody = {
      recipient: {
        id: recipient,
      },
      message,
    };

    const { body } = await request(this.endpoint, {
      body: JSON.stringify(reqBody),
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
    });

    const json = await body.json();
    return json;
  }

  sendRecieptMessage(
    recipient: string,
    transaction: Transaction & {
      category: Category | null;
      tags: TransactionTag[];
    }
  ) {
    const { amount, type, title, category, tags } = transaction;
    const computedTitle =
      type === TransactionType.EXPENSE
        ? `Spend ${amount}`
        : `Receive ${amount}`;

    let subtitle = '';
    if (title) {
      subtitle += title;
    }

    if (category) {
      subtitle += `\n${category.title || category.slug}`;
    }

    if (tags?.length) {
      subtitle += `\n${tags.map((tag) => tag.tag).join(' ')}`;
    }
    const reqBody = {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: [
            {
              title: computedTitle,
              image_url:
                'https://raw.githubusercontent.com/fbsamples/original-coast-clothing/main/public/styles/male-work.jpg',
              subtitle: subtitle || undefined,
              buttons: [
                {
                  type: 'postback',
                  title: 'Undo',
                  payload: JSON.stringify({
                    transactionId: transaction.id,
                  }),
                },
              ],
            },
          ],
        },
      },
    };
    return this.sendMessage({ recipient, message: reqBody });
  }

  async processMessage({
    message,
    recipient,
  }: {
    message: string;
    recipient: string;
  }) {
    const extractedInfo = extractMessage(message);

    await this.walletService.addTransaction({
      ...extractedInfo,
      userId: recipient,
    });
  }
}
