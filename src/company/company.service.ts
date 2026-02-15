import { BadRequestException, Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompanyService {
  constructor(private readonly prisma: PrismaService) {}

  async companies(userId: string) {
    return this.prisma.company.findMany({
      where: { memberships: { some: { userId } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createCompany(userId: string, name: string, website?: string | null) {
    if (typeof name !== 'string' || !name.trim()) {
      throw new BadRequestException('Company name is required');
    }

    const company = await this.prisma.company.create({
      data: {
        name: name.trim(),
        website: website ?? null,
        memberships: {
          create: {
            userId,
            role: Role.OWNER,
          },
        },
      },
    });

    await this.prisma.activityLog.create({
      data: {
        actorId: userId,
        action: 'COMPANY_CREATED',
        entityType: 'Company',
        entityId: company.id,
        metadata: { name: company.name },
      },
    });

    return company;
  }
}
