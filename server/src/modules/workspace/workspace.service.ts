import { workspaceRepository } from './repositories/workspace.repository';
import { authRepository } from '~/modules/auth/repositories/auth.repository';
import { ApiError } from '~/utils/errors';
import { Role, Workspace, WorkspaceMember } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { prisma } from '~/config/db';

export class WorkspaceService {
  async getWorkspace(id: string): Promise<Workspace> {
    const workspace = await workspaceRepository.findById(id);
    if (!workspace) {
      throw ApiError.notFound('Workspace not found');
    }
    return workspace;
  }

  async updateWorkspace(id: string, data: {
    name?: string;
    logoUrl?: string;
    gstNumber?: string;
    currency?: string;
    timezone?: string;
    invoicePrefix?: string;
    address?: string;
    phone?: string;
    email?: string;
  }): Promise<Workspace> {
    const workspace = await this.getWorkspace(id);
    return workspaceRepository.update(id, data);
  }

  async getTeamMembers(workspaceId: string) {
    await this.getWorkspace(workspaceId);
    return workspaceRepository.listMembers(workspaceId);
  }

  async inviteTeamMember(workspaceId: string, email: string, role: Role) {
    await this.getWorkspace(workspaceId);

    // 1. Check if user is already a member of this workspace
    let user = await authRepository.findByEmail(email);
    if (user) {
      const existingMember = await workspaceRepository.findMemberByWorkspaceAndUser(workspaceId, user.id);
      if (existingMember) {
        throw ApiError.badRequest('User is already a member of this workspace');
      }
    }

    // 2. If user does not exist, create a pending/invited user account
    if (!user) {
      const tempPasswordHash = await bcrypt.hash(`InvitedUserTempPass!${Math.random()}`, 10);
      // Create user using prisma transaction or repository
      user = await prisma.user.create({
        data: {
          email,
          passwordHash: tempPasswordHash,
          firstName: 'Invited',
          lastName: 'Member',
          isVerified: false,
        },
      });
    }

    // 3. Create the workspace member link
    return workspaceRepository.addMember(workspaceId, user.id, role);
  }

  async updateMemberRole(workspaceId: string, currentUserId: string, membershipId: string, newRole: Role) {
    const membership = await workspaceRepository.findMemberById(membershipId);
    if (!membership || membership.workspaceId !== workspaceId) {
      throw ApiError.notFound('Team member not found in this workspace');
    }

    // Check if the membership to update belongs to the OWNER
    if (membership.role === Role.OWNER) {
      throw ApiError.badRequest('Cannot change the role of the workspace Owner');
    }

    // Prevent changing your own role if you are not Owner/Admin
    if (membership.userId === currentUserId && newRole !== membership.role) {
      // Allow only Owner/Admin to adjust roles, but prevent self-downgrading unless another admin exists.
      // For simplicity, we block modifying self role to prevent locked out states.
      throw ApiError.badRequest('Cannot change your own role settings directly');
    }

    return workspaceRepository.updateMemberRole(membershipId, newRole);
  }

  async removeMember(workspaceId: string, currentUserId: string, membershipId: string) {
    const membership = await workspaceRepository.findMemberById(membershipId);
    if (!membership || membership.workspaceId !== workspaceId) {
      throw ApiError.notFound('Team member not found in this workspace');
    }

    if (membership.role === Role.OWNER) {
      throw ApiError.badRequest('Cannot remove the workspace Owner');
    }

    if (membership.userId === currentUserId) {
      throw ApiError.badRequest('Cannot remove yourself from the workspace. Use Leave Workspace flow if available.');
    }

    return workspaceRepository.deleteMember(membershipId);
  }
}

export const workspaceService = new WorkspaceService();
