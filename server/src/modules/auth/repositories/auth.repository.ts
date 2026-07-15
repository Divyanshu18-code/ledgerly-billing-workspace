import { prisma } from '~/config/db';
import { User, Prisma } from '@prisma/client';

export class AuthRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({
      data,
    });
  }

  async createUserWithWorkspace(
    userCreateData: Prisma.UserCreateInput,
    workspaceName: string
  ): Promise<{ user: User; workspace: any }> {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: userCreateData,
      });

      const workspace = await tx.workspace.create({
        data: {
          name: workspaceName,
        },
      });

      await tx.workspaceMember.create({
        data: {
          workspaceId: workspace.id,
          userId: user.id,
          role: 'OWNER',
        },
      });

      return { user, workspace };
    });
  }

  async updateUser(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async findByResetToken(token: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: { resetToken: token },
    });
  }
}

export const authRepository = new AuthRepository();
// Also export class if instantiation is needed dynamically in testing
