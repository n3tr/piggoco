import { PrismaClient, User } from '@prisma/client';

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
    const user = await this.prisma.user.findFirst({ where: { fbPsId } });
    if (!user && createIfNotExist) {
      return this.prisma.user.create({ data: { fbPsId } });
    }

    return user;
  }
}
