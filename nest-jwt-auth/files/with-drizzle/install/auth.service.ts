import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import { DrizzleService } from '../db/drizzle.service';
import { usersTable } from './users.schema';
import type { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly drizzle: DrizzleService,
    private readonly jwt: JwtService,
  ) {}

  async register(email: string, password: string): Promise<{ access_token: string }> {
    const [existing] = await this.drizzle.db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(password, 10);
    const [user] = await this.drizzle.db
      .insert(usersTable)
      .values({ email, passwordHash })
      .returning({ id: usersTable.id, email: usersTable.email });

    return { access_token: this.sign({ sub: user.id, email: user.email }) };
  }

  async login(email: string, password: string): Promise<{ access_token: string }> {
    const [user] = await this.drizzle.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return { access_token: this.sign({ sub: user.id, email: user.email }) };
  }

  sign(payload: JwtPayload): string {
    return this.jwt.sign(payload);
  }
}
