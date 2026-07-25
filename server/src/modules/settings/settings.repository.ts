import { prisma } from '../../config/db';

export class BusinessSettingsRepository {
  async getSettings(workspaceId: string) {
    let settings = await prisma.businessSettings.findUnique({
      where: { workspaceId },
    });

    if (!settings) {
      settings = await prisma.businessSettings.create({
        data: {
          workspaceId,
          companyName: 'Alex Enterprise Group',
        },
      });
    }

    return settings;
  }

  async updateSettings(workspaceId: string, data: any) {
    return await prisma.businessSettings.upsert({
      where: { workspaceId },
      update: data,
      create: {
        workspaceId,
        ...data,
      },
    });
  }
}
