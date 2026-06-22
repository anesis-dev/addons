import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OAuthUser } from './oauth.types';

@Injectable()
export class OAuthService {
  constructor(private readonly jwt: JwtService) {}

  /**
   * Called by every provider callback once Passport has produced an OAuthUser.
   * TODO: find-or-create the user in your database (match on provider +
   * providerId, or on email) and use the persisted id as the JWT `sub`.
   */
  async login(user: OAuthUser) {
    const payload = {
      sub: user.providerId,
      email: user.email,
      provider: user.provider,
    };

    return {
      user,
      accessToken: await this.jwt.signAsync(payload),
    };
  }
}
