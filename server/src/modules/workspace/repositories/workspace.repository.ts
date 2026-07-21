import { prisma } from '~/config/db';
import { Prisma, Workspace, WorkspaceMember, Role, WorkspaceInvitation } from '@prisma/client';

export class WorkspaceRepository {
  async findById(id: string): Promise<Workspace | null> {
    return prisma.workspace.findFirst({
      where: {
        id,
        isArchived: false,
      },
    });
  }

  async update(id: string, data: Partial<Prisma.WorkspaceUpdateInput>): Promise<Workspace> {
    return prisma.workspace.update({
      where: { id },
      data,
    });
  }

  async createWorkspace(name: string, userId: string, data: any): Promise<Workspace> {
    return prisma.$transaction(async (tx) => {
      // 1. Create Workspace
      const workspace = await tx.workspace.create({
        data: {
          name,
          currency: data.currency || 'INR',
          timezone: data.timezone || 'UTC',
          invoicePrefix: data.invoicePrefix || 'INV-',
          financialYear: data.financialYear || '2026-2027',
          gstNumber: data.gstNumber || null,
          address: data.address || null,
          phone: data.phone || null,
          email: data.email || null,
          logoUrl: data.logoUrl || null,
          createdById: userId,
        },
      });

      // 2. Add creator as OWNER in WorkspaceMember
      await tx.workspaceMember.create({
        data: {
          workspaceId: workspace.id,
          userId,
          role: Role.OWNER,
        },
      });

      return workspace;
    });
  }

  async listActiveWorkspacesForUser(userId: string): Promise<Workspace[]> {
    return prisma.workspace.findMany({
      where: {
        isArchived: false,
        workspaceMembers: {
          some: {
            userId,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async softDelete(id: string): Promise<Workspace> {
    return prisma.workspace.update({
      where: { id },
      data: {
        isArchived: true,
        deletedAt: new Date(),
      },
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

  // Invitation repositories methods
  async findInvitationByToken(token: string): Promise<WorkspaceInvitation | null> {
    return prisma.workspaceInvitation.findUnique({
      where: { token },
      include: {
        workspace: true,
      },
    });
  }

  async createInvitation(
    workspaceId: string,
    email: string,
    role: Role,
    token: string,
    invitedById: string
  ): Promise<WorkspaceInvitation> {
    // If invitation already exists for this email in this workspace, delete it first to send a new one
    await prisma.workspaceInvitation.deleteMany({
      where: { workspaceId, email },
    });

    // Create invitation with 7-day expiration
    return prisma.workspaceInvitation.create({
      data: {
        workspaceId,
        email,
        role,
        token,
        invitedById,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  }

  async updateInvitationStatus(id: string, status: string): Promise<WorkspaceInvitation> {
    return prisma.workspaceInvitation.update({
      where: { id },
      data: { status },
    });
  }

  async transferOwnership(
    workspaceId: string,
    currentOwnerMemberId: string,
    targetMemberId: string
  ): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // 1. Demote old owner to ADMIN
      await tx.workspaceMember.update({
        where: { id: currentOwnerMemberId },
        data: { role: Role.ADMIN },
      });

      // 2. Promote target member to OWNER
      await tx.workspaceMember.update({
        where: { id: targetMemberId },
        data: { role: Role.OWNER },
      });
    });
  }
}

export const workspaceRepository = new WorkspaceRepository();
