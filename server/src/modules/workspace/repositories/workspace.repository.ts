import { prisma } from '~/config/db';
import { Prisma, Workspace, WorkspaceMember, Role } from '@prisma/client';

export class WorkspaceRepository {
  async findById(id: string): Promise<Workspace | null> {
    return prisma.workspace.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: Partial<Prisma.WorkspaceUpdateInput>): Promise<Workspace> {
    return prisma.workspace.update({
      where: { id },
      data,
    });
  }

  async findMemberByWorkspaceAndUser(workspaceId: string, userId: string): Promise<WorkspaceMember | null> {
    return prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });
  }

  async findMemberById(membershipId: string): Promise<WorkspaceMember | null> {
    return prisma.workspaceMember.findUnique({
      where: { id: membershipId },
    });
  }

  async listMembers(workspaceId: string) {
    return prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            isVerified: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async addMember(workspaceId: string, userId: string, role: Role): Promise<WorkspaceMember> {
    return prisma.workspaceMember.create({
      data: {
        workspaceId,
        userId,
        role,
      },
    });
  }

  async updateMemberRole(membershipId: string, role: Role): Promise<WorkspaceMember> {
    return prisma.workspaceMember.update({
      where: { id: membershipId },
      data: { role },
    });
  }

  async deleteMember(membershipId: string): Promise<WorkspaceMember> {
    return prisma.workspaceMember.delete({
      where: { id: membershipId },
    });
  }
}

export const workspaceRepository = new WorkspaceRepository();
