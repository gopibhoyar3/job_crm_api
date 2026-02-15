import { ForbiddenException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export async function ensureCompanyRole(
  prisma: PrismaService,
  userId: string,
  companyId: string,
  allowed: Role[],
): Promise<void> {
  const membership = await prisma.membership.findUnique({
    where: {
      userId_companyId: {
        userId,
        companyId,
      },
    },
  });

  if (!membership || !allowed.includes(membership.role)) {
    throw new ForbiddenException('Insufficient role for this company');
  }
}
