import { FederationProvider, PrismaClient, User } from '@prisma/client';

export class UserService {
  private prisma: PrismaClient;
  constructor(options: { prismaClient: PrismaClient }) {
    this.prisma = options.prismaClient;
  }

  async userByfbPsId(fbPsId: string, createIfNotExist: true): Promise<User>;
  async userByfbPsId(
    fbPsId: string,
    createIfNotExist: false
  ): Promise<User | null>;
  async userByfbPsId(
    fbPsId: string,
    createIfNotExist = false
  ): Promise<User | null> {
    const account = await this.prisma.federatedAccount.findFirst({
      where: {
        provider: FederationProvider.FACEBOOK_PAGE,
        subject: fbPsId,
      },
      include: {
        user: true,
      },
    });
    if (account) {
      const user = account.user;
      return user;
    }
    if (createIfNotExist) {
      return this.prisma.user.create({
        data: {
          fbPsId,
          federatedAccounts: {
            create: {
              provider: FederationProvider.FACEBOOK_PAGE,
              subject: fbPsId,
            },
          },
        },
      });
    }

    return null;
  }
}
