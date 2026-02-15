import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { ApplicationStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

function encodeCursor(date: Date, id: string): string {
  return Buffer.from(`${date.toISOString()}::${id}`, 'utf8').toString('base64url');
}

function decodeCursor(cursor: string): { createdAt: Date; id: string } {
  const raw = Buffer.from(cursor, 'base64url').toString('utf8');
  const [iso, id] = raw.split('::');
  if (!iso || !id) {
    throw new BadRequestException('Invalid cursor');
  }
  const createdAt = new Date(iso);
  if (Number.isNaN(createdAt.getTime())) {
    throw new BadRequestException('Invalid cursor');
  }
  return { createdAt, id };
}

const allowedTransitions: Record<ApplicationStatus, ApplicationStatus[]> = {
  APPLIED: ['RECRUITER_SCREEN', 'WITHDRAWN', 'REJECTED'],
  RECRUITER_SCREEN: ['INTERVIEW_1', 'REJECTED', 'WITHDRAWN'],
  INTERVIEW_1: ['INTERVIEW_2', 'REJECTED', 'WITHDRAWN'],
  INTERVIEW_2: ['ONSITE', 'OFFER', 'REJECTED', 'WITHDRAWN'],
  ONSITE: ['OFFER', 'REJECTED', 'WITHDRAWN'],
  OFFER: ['WITHDRAWN'],
  REJECTED: [],
  WITHDRAWN: [],
};

@Injectable()
export class ApplicationService {
  constructor(private readonly prisma: PrismaService) {}

  async createApplication(userId: string, jobId: string, sourceUrl?: string) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      throw new BadRequestException('Job not found');
    }

    const app = await this.prisma.application.create({
      data: {
        userId,
        jobId,
        sourceUrl: sourceUrl ?? null,
      },
      include: {
        job: { include: { company: true } },
        notes: { orderBy: { createdAt: 'desc' } },
      },
    });

    await this.prisma.activityLog.create({
      data: {
        actorId: userId,
        action: 'APPLICATION_CREATED',
        entityType: 'Application',
        entityId: app.id,
        applicationId: app.id,
        metadata: { jobId },
      },
    });

    return app;
  }

  async moveStatus(userId: string, applicationId: string, nextStatus: ApplicationStatus) {
    const current = await this.prisma.application.findUnique({ where: { id: applicationId } });
    if (!current) {
      throw new BadRequestException('Application not found');
    }
    if (current.userId !== userId) {
      throw new ForbiddenException('Forbidden');
    }

    const allowed = allowedTransitions[current.status] ?? [];
    if (!allowed.includes(nextStatus)) {
      throw new BadRequestException(`Invalid transition: ${current.status} -> ${nextStatus}`);
    }

    const updated = await this.prisma.application.update({
      where: { id: applicationId },
      data: { status: nextStatus },
      include: {
        job: { include: { company: true } },
        notes: { orderBy: { createdAt: 'desc' } },
      },
    });

    await this.prisma.activityLog.create({
      data: {
        actorId: userId,
        action: 'APPLICATION_STATUS_CHANGED',
        entityType: 'Application',
        entityId: updated.id,
        applicationId: updated.id,
        metadata: {
          from: current.status,
          to: nextStatus,
        },
      },
    });

    return updated;
  }

  async addNote(userId: string, applicationId: string, body: string) {
    const app = await this.prisma.application.findUnique({ where: { id: applicationId } });
    if (!app) {
      throw new BadRequestException('Application not found');
    }
    if (app.userId !== userId) {
      throw new ForbiddenException('Forbidden');
    }

    const note = await this.prisma.note.create({
      data: { applicationId, createdById: userId, body },
    });

    await this.prisma.activityLog.create({
      data: {
        actorId: userId,
        action: 'NOTE_ADDED',
        entityType: 'Application',
        entityId: applicationId,
        applicationId,
        metadata: { noteId: note.id },
      },
    });

    return note;
  }

  async getApplication(userId: string, id: string) {
    const app = await this.prisma.application.findFirst({
      where: { id, userId },
      include: {
        job: { include: { company: true } },
        notes: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!app) {
      throw new BadRequestException('Application not found');
    }
    return app;
  }

  async applicationsConnection(
    userId: string,
    first: number,
    after?: string,
    filter?: {
      statuses?: ApplicationStatus[];
      companyId?: string;
      jobId?: string;
      search?: string;
    },
  ) {
    if (first < 1 || first > 50) {
      throw new BadRequestException('first must be 1..50');
    }

    const where: Prisma.ApplicationWhereInput = { userId };

    if (filter?.statuses?.length) {
      where.status = { in: filter.statuses };
    }

    if (filter?.jobId) {
      where.jobId = filter.jobId;
    }

    if (filter?.companyId) {
      where.job = { companyId: filter.companyId };
    }

    if (filter?.search?.trim()) {
      const q = filter.search.trim();
      where.OR = [
        { job: { title: { contains: q, mode: 'insensitive' } } },
        { job: { company: { name: { contains: q, mode: 'insensitive' } } } },
      ];
    }

    if (after) {
      const cursor = decodeCursor(after);
      const cursorClause: Prisma.ApplicationWhereInput = {
        OR: [
          { createdAt: { lt: cursor.createdAt } },
          { createdAt: cursor.createdAt, id: { lt: cursor.id } },
        ],
      };

      where.AND = where.AND ? [...(Array.isArray(where.AND) ? where.AND : [where.AND]), cursorClause] : [cursorClause];
    }

    const rows = await this.prisma.application.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: first + 1,
      include: {
        job: { include: { company: true } },
        notes: { orderBy: { createdAt: 'desc' } },
      },
    });

    const hasNextPage = rows.length > first;
    const slice = hasNextPage ? rows.slice(0, first) : rows;

    const edges = slice.map((node) => ({
      node,
      cursor: encodeCursor(node.createdAt, node.id),
    }));

    return {
      edges,
      pageInfo: {
        hasNextPage,
        endCursor: edges.length ? edges[edges.length - 1].cursor : undefined,
      },
    };
  }
}
