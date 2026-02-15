import { BadRequestException, Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { ensureCompanyRole } from '../common/rbac.util';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JobService {
  constructor(private readonly prisma: PrismaService) {}

  async jobs(userId: string, companyId?: string) {
    if (companyId) {
      await ensureCompanyRole(this.prisma, userId, companyId, [Role.OWNER, Role.EDITOR, Role.VIEWER]);
      return this.prisma.job.findMany({
        where: { companyId },
        include: { company: true },
        orderBy: { createdAt: 'desc' },
      });
    }

    return this.prisma.job.findMany({
      where: {
        company: {
          memberships: {
            some: { userId },
          },
        },
      },
      include: { company: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createJob(
    userId: string,
    input: { companyId: string; title: string; description?: string; location?: string },
  ) {
    const company = await this.prisma.company.findUnique({ where: { id: input.companyId } });
    if (!company) {
      throw new BadRequestException('Company not found');
    }

    await ensureCompanyRole(this.prisma, userId, input.companyId, [Role.OWNER, Role.EDITOR]);

    const job = await this.prisma.job.create({
      data: {
        companyId: input.companyId,
        title: input.title,
        description: input.description ?? null,
        location: input.location ?? null,
      },
      include: { company: true },
    });

    await this.prisma.activityLog.create({
      data: {
        actorId: userId,
        action: 'JOB_CREATED',
        entityType: 'Job',
        entityId: job.id,
        metadata: { companyId: job.companyId, title: job.title },
      },
    });

    return job;
  }
}
