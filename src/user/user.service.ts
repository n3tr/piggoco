import { FederationProvider, PrismaClient, User } from '@prisma/client';
import { FacebookGraphClient } from '../facebook/client';

export class UserService {
  private prisma: PrismaClient;
  private fbClient: FacebookGraphClient;
  constructor(options: {
    prismaClient: PrismaClient;
    fbClient: FacebookGraphClient;
  }) {
    this.prisma = options.prismaClient;
    this.fbClient = options.fbClient;
  }

  async findById(id: string) {
    return this.prisma.user.findFirst({ where: { id } });
  }

  async userByfbAppScopeId(
    fbAsId: string,
    createIfNotExist: true
  ): Promise<User>;
  async userByfbAppScopeId(
    fbAsId: string,
    createIfNotExist: false
  ): Promise<User | null>;
  async userByfbAppScopeId(
    fbAsId: string,
    createIfNotExist = false
  ): Promise<User | null> {
    const account = await this.prisma.federatedAccount.findFirst({
      where: {
        provider: FederationProvider.FACEBOOK_APP,
        subject: fbAsId,
      },
      include: {
        user: true,
      },
    });

    if (account) {
      return account.user;
    }

    // Get user page id
    const result = await this.fbClient.getUserPageScopeByAppId(fbAsId);
    if (result) {
      const user = await this.userByfbPageScopeId(result.id, false);
      // Found user that have the User Page ID linkd to
      // Update user
      if (user) {
        const newAccount = await this.prisma.federatedAccount.create({
          data: {
            provider: FederationProvider.FACEBOOK_APP,
            subject: fbAsId,
            userId: user.id,
          },
          include: { user: true },
        });
        return newAccount.user;
      }
    }

    if (!createIfNotExist) {
      return null;
    }

    // User doesn't have page-scoped ID on Facebook - No interact with page before
    // User doesn't have user record with page-scoped ID - Interact with page but never chat
    return this.prisma.user.create({
      data: {
        federatedAccounts: {
          create: [
            {
              provider: FederationProvider.FACEBOOK_APP,
              subject: fbAsId,
            },
          ],
        },
      },
    });
  }

  async userByfbPageScopeId(
    fbPsId: string,
    createIfNotExist: true
  ): Promise<User>;
  async userByfbPageScopeId(
    fbPsId: string,
    createIfNotExist: false
  ): Promise<User | null>;
  async userByfbPageScopeId(
    fbPsId: string,
    createIfNotExist = false
  ): Promise<User | null> {
    // Find user that have page-scoped id link to
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

    // Fetch app scoped user id
    const appScopedUser = await this.fbClient.getUserAppScopeByPsId(fbPsId);
    if (appScopedUser) {
      const user = await this.userByfbAppScopeId(appScopedUser.id, false);

      if (user) {
        const newAccount = await this.prisma.federatedAccount.create({
          data: {
            provider: FederationProvider.FACEBOOK_PAGE,
            subject: fbPsId,
            userId: user.id,
          },
          include: { user: true },
        });
        return newAccount.user;
      }
    }

    if (!createIfNotExist) {
      return null;
    }

    return this.prisma.user.create({
      data: {
        federatedAccounts: {
          create: {
            provider: FederationProvider.FACEBOOK_PAGE,
            subject: fbPsId,
          },
        },
      },
    });
  }
}
