import { PrismaClient } from '@prisma/client';
import { WalletTransaction } from '../types';

type WalletTransactionInput = WalletTransaction & {
  userId: string;
};

export class WalletService {
  private prisma: PrismaClient;
  constructor(options: { prismaClient: PrismaClient }) {
    this.prisma = options.prismaClient;
  }

  async getDefaultWallet(userId: string) {
    const wallet = await this.prisma.wallet.findFirst({
      where: {
        userId,
        name: 'default',
      },
    });

    if (wallet) {
      return wallet;
    }

    return this.prisma.wallet.create({
      data: {
        userId,
      },
    });
  }

  async addTransaction(input: WalletTransactionInput) {
    const { amount, title, category, tags, type } = input;
    const wallet = await this.getDefaultWallet(input.userId);

    let categoryId: string | undefined;
    if (category) {
      const cat = await this.prisma.category.upsert({
        where: {
          walletId_slug: {
            walletId: wallet.id,
            slug: category,
          },
        },
        create: {
          slug: category,
          walletId: wallet.id,
        },
        update: {},
      });

      categoryId = cat.id;
    }

    return this.prisma.transaction.create({
      data: {
        amount,
        title,
        categoryId,
        walletId: wallet.id,
        tags: {
          create: tags?.map((tag) => ({ tag })),
        },
        type,
      },
      include: {
        tags: true,
        category: true,
      },
    });
  }

  deleteTransaction(transactionId: string) {
    return this.prisma.transaction.delete({
      where: {
        id: transactionId,
      },
      include: {
        tags: true,
        category: true,
      },
    });
  }
}
