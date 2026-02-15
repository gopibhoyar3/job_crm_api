import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async signup(email: string, password: string, name?: string | null): Promise<{ accessToken: string }> {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new BadRequestException('Email already in use');
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: { email, password: hashed, name: name ?? null },
    });

    return this.issueToken(user.id, user.email);
  }

  async login(email: string, password: string): Promise<{ accessToken: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const matches = await bcrypt.compare(password, user.password);
    if (!matches) {
      throw new BadRequestException('Invalid credentials');
    }

    return this.issueToken(user.id, user.email);
  }

  issueToken(userId: string, email: string): { accessToken: string } {
    const accessToken = this.jwt.sign({ sub: userId, email });
    return { accessToken };
  }
}
