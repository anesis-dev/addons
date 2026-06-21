import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(private readonly jwt: JwtService) {}

  // TODO: implement using your DB layer of choice
  async register(_email: string, _password: string): Promise<{ access_token: string }> {
    throw new UnauthorizedException('register not implemented');
  }

  async login(_email: string, _password: string): Promise<{ access_token: string }> {
    throw new UnauthorizedException('login not implemented');
  }

  sign(payload: JwtPayload): string {
    return this.jwt.sign(payload);
  }

  verify(token: string): JwtPayload {
    return this.jwt.verify<JwtPayload>(token);
  }
}
