import { request } from 'undici';
import { JsonObject } from 'type-fest';
import { FacebookPageToken } from '../config';
import { extractMessage } from '../utils/extract-message';
import { WalletService } from '../wallet/wallet.service';
import { TransactionType } from '../types';
import { Category, Transaction, TransactionTag } from '@prisma/client';

const SEND_MESSENGE_ENDPOINT = 'https://graph.facebook.com/v13.0/me/messages';
const TOKEN = FacebookPageToken;

const EXPENSE_IMAGE =
  'https://spendot.s3.ap-southeast-1.amazonaws.com/expense.jpg';
const INCOME_IMAGE =
  'https://spendot.s3.ap-southeast-1.amazonaws.com/income.jpg';
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
    const { amount: rawAmount, type, title, category, tags } = transaction;
    const amount = rawAmount.toFixed(2);
    let computedTitle =
      type === TransactionType.EXPENSE ? `${amount}` : `+${amount}`;

    const image =
      type === TransactionType.EXPENSE ? EXPENSE_IMAGE : INCOME_IMAGE;

    if (title) {
      computedTitle += ` - ${title}`;
    }

    let subtitle = '';
    if (category) {
      subtitle += `${category.title || category.slug}`;
    }

    if (tags?.length) {
      if (subtitle) {
        subtitle += '\n';
      }
      subtitle += `${tags.map((tag) => tag.tag).join(' ')}`;
    }
    const reqBody = {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: [
            {
              title: computedTitle,
              image_url: image,
              subtitle: subtitle || undefined,
              buttons: [
                {
                  type: 'postback',
                  title: 'Delete',
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
