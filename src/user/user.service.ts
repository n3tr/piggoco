import { PrismaClient, User } from '@prisma/client';

export class UserService {
  private prisma: PrismaClient;
  constructor(options: { prismaClient: PrismaClient }) {
    this.prisma = options.prismaClient;
  }

  async userByFbId(fbId: string, createIfNotExist: true): Promise<User>;
  async userByFbId(fbId: string, createIfNotExist: false): Promise<User | null>;
  async userByFbId(
    fbId: string,
    createIfNotExist = false
  ): Promise<User | null> {
    const user = await this.prisma.user.findFirst({ where: { fbId } });
    if (!user && createIfNotExist) {
      return this.prisma.user.create({ data: { fbId } });
    }

    return user;
  }
}
