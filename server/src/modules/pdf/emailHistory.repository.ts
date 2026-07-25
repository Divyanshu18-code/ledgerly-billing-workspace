import { prisma } from '../../config/db';

export class EmailHistoryRepository {
  async logEmail(data: {
    workspaceId: string;
    documentType: string;
    documentId: string;
    recipient: string;
    cc?: string;
    bcc?: string;
    subject: string;
    message?: string;
    status: string;
    createdById?: string;
  }) {
    return await prisma.emailHistory.create({
      data: {
        workspaceId: data.workspaceId,
        documentType: data.documentType,
        documentId: data.documentId,
        recipient: data.recipient,
        cc: data.cc || null,
        bcc: data.bcc || null,
        subject: data.subject,
        message: data.message || null,
        status: data.status,
        createdById: data.createdById || null,
      },
      include: {
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async getHistory(workspaceId: string) {
    return await prisma.emailHistory.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }
}
