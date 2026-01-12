import { prisma } from '../../config/database.ts';

export class AuthRepo {
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });
  }

  async createRefreshToken(userId: number, hashedToken: string, expiresAt: Date) {
    return prisma.refreshToken.create({
      data: {
        userId,
        token: hashedToken,
        expiresAt,
      },
    });
  }

  async revokeRefreshTokens(userId: number) {
    return prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });
  }

  async findValidRefreshTokens(userId: number) {
    return prisma.refreshToken.findMany({
      where: {
        userId,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
    });
  }

  async findUserById(userId: number) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });
  }

  async updateUserStatus(userId: number, isActive: boolean) {
    return prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });
  }
}
