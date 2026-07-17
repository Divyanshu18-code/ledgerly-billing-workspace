import { workspaceRepository } from './repositories/workspace.repository';
import { authRepository } from '~/modules/auth/repositories/auth.repository';
import { ApiError } from '~/utils/errors';
import { Role, Workspace, WorkspaceMember, WorkspaceInvitation } from '@prisma/client';
import crypto from 'crypto';

export class WorkspaceService {
  async getWorkspace(id: string, userId: string): Promise<Workspace> {
    // Verify membership
    const membership = await workspaceRepository.findMemberByWorkspaceAndUser(id, userId);
    if (!membership) {
      throw ApiError.forbidden('You do not belong to this workspace');
    }

    const workspace = await workspaceRepository.findById(id);
    if (!workspace) {
      throw ApiError.notFound('Workspace not found or archived');
    }
    return workspace;
  }

  async createWorkspace(userId: string, data: {
    name: string;
    logoUrl?: string;
    gstNumber?: string;
    currency?: string;
    timezone?: string;
    invoicePrefix?: string;
    address?: string;
    phone?: string;
    email?: string;
    financialYear?: string;
  }): Promise<Workspace> {
    if (!data.name) {
      throw ApiError.badRequest('Workspace Name is required');
    }
    return workspaceRepository.createWorkspace(data.name, userId, data);
  }

  async listWorkspaces(userId: string): Promise<Workspace[]> {
    return workspaceRepository.listActiveWorkspacesForUser(userId);
  }

  async updateWorkspace(id: string, userId: string, data: {
    name?: string;
    logoUrl?: string;
    gstNumber?: string;
    currency?: string;
    timezone?: string;
    invoicePrefix?: string;
    address?: string;
    phone?: string;
    email?: string;
    financialYear?: string;
  }): Promise<Workspace> {
    // Check membership and role first (routes will have RBAC, but let's confirm membership)
    const membership = await workspaceRepository.findMemberByWorkspaceAndUser(id, userId);
    if (!membership || (membership.role !== Role.OWNER && membership.role !== Role.ADMIN)) {
      throw ApiError.forbidden('Insufficient permissions to modify workspace details');
    }

    const workspace = await workspaceRepository.findById(id);
    if (!workspace) {
      throw ApiError.notFound('Workspace not found');
    }

    return workspaceRepository.update(id, data);
  }

  async archiveWorkspace(id: string, userId: string): Promise<Workspace> {
    // Verify user is OWNER
    const membership = await workspaceRepository.findMemberByWorkspaceAndUser(id, userId);
    if (!membership || membership.role !== Role.OWNER) {
      throw ApiError.forbidden('Only the Workspace Owner can archive this workspace');
    }

    const workspace = await workspaceRepository.findById(id);
    if (!workspace) {
      throw ApiError.notFound('Workspace not found');
    }

    return workspaceRepository.softDelete(id);
  }

  async switchWorkspace(userId: string, workspaceId: string): Promise<{ success: boolean; workspace: Workspace }> {
    const membership = await workspaceRepository.findMemberByWorkspaceAndUser(workspaceId, userId);
    if (!membership) {
      throw ApiError.forbidden('You do not have access to this workspace');
    }

    const workspace = await workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw ApiError.notFound('Workspace not found or archived');
    }

    return {
      success: true,
      workspace,
    };
  }

  async getTeamMembers(workspaceId: string, userId: string) {
    const membership = await workspaceRepository.findMemberByWorkspaceAndUser(workspaceId, userId);
    if (!membership) {
      throw ApiError.forbidden('You do not belong to this workspace');
    }

    return workspaceRepository.listMembers(workspaceId);
  }

  async inviteTeamMember(workspaceId: string, invitedByUserId: string, email: string, role: Role): Promise<WorkspaceInvitation> {
    // 1. Check if user is already a member
    const invitedUser = await authRepository.findByEmail(email);
    if (invitedUser) {
      const existingMember = await workspaceRepository.findMemberByWorkspaceAndUser(workspaceId, invitedUser.id);
      if (existingMember) {
        throw ApiError.badRequest('User is already a member of this workspace');
      }
    }

    // 2. Generate unique token
    const token = crypto.randomBytes(32).toString('hex');

    // 3. Create invitation
    return workspaceRepository.createInvitation(workspaceId, email, role, token, invitedByUserId);
  }

  async acceptInvitation(userId: string, token: string): Promise<WorkspaceMember> {
    const invitation = await workspaceRepository.findInvitationByToken(token);
    if (!invitation) {
      throw ApiError.notFound('Invitation not found or invalid');
    }

    if (invitation.status !== 'PENDING') {
      throw ApiError.badRequest(`This invitation has already been ${invitation.status.toLowerCase()}`);
    }

    if (invitation.expiresAt < new Date()) {
      await workspaceRepository.updateInvitationStatus(invitation.id, 'EXPIRED');
      throw ApiError.badRequest('This invitation token has expired');
    }

    // Retrieve the user email to check match
    const user = await authRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('User context not found');
    }

    if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      throw ApiError.forbidden('This invitation was sent to a different email address');
    }

    // 1. Add user as member
    const existingMember = await workspaceRepository.findMemberByWorkspaceAndUser(invitation.workspaceId, userId);
    if (existingMember) {
      await workspaceRepository.updateInvitationStatus(invitation.id, 'ACCEPTED');
      return existingMember;
    }

    const member = await workspaceRepository.addMember(invitation.workspaceId, userId, invitation.role);

    // 2. Mark invitation status as ACCEPTED
    await workspaceRepository.updateInvitationStatus(invitation.id, 'ACCEPTED');

    return member;
  }

  async leaveWorkspace(workspaceId: string, userId: string): Promise<void> {
    const membership = await workspaceRepository.findMemberByWorkspaceAndUser(workspaceId, userId);
    if (!membership) {
      throw ApiError.notFound('Membership not found in this workspace');
    }

    // Prevent Owner from leaving
    if (membership.role === Role.OWNER) {
      throw ApiError.badRequest('Workspace Owner cannot leave the workspace. You must transfer ownership first.');
    }

    await workspaceRepository.deleteMember(membership.id);
  }

  async transferOwnership(workspaceId: string, currentOwnerUserId: string, targetUserId: string): Promise<void> {
    const ownerMembership = await workspaceRepository.findMemberByWorkspaceAndUser(workspaceId, currentOwnerUserId);
    if (!ownerMembership || ownerMembership.role !== Role.OWNER) {
      throw ApiError.forbidden('Only the current Workspace Owner can transfer ownership');
    }

    const targetMembership = await workspaceRepository.findMemberByWorkspaceAndUser(workspaceId, targetUserId);
    if (!targetMembership) {
      throw ApiError.notFound('Target user is not a member of this workspace');
    }

    if (targetMembership.userId === currentOwnerUserId) {
      throw ApiError.badRequest('You cannot transfer ownership to yourself');
    }

    // Transfer ownership in transaction
    await workspaceRepository.transferOwnership(workspaceId, ownerMembership.id, targetMembership.id);
  }

  async updateMemberRole(workspaceId: string, currentUserId: string, membershipId: string, newRole: Role) {
    const membership = await workspaceRepository.findMemberById(membershipId);
    if (!membership || membership.workspaceId !== workspaceId) {
      throw ApiError.notFound('Team member not found in this workspace');
    }

    if (membership.role === Role.OWNER) {
      throw ApiError.badRequest('Cannot change the role of the workspace Owner');
    }

    if (membership.userId === currentUserId && newRole !== membership.role) {
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
      throw ApiError.badRequest('Cannot remove yourself from the workspace. Use Leave Workspace flow instead.');
    }

    return workspaceRepository.deleteMember(membership.id);
  }
}

export const workspaceService = new WorkspaceService();
