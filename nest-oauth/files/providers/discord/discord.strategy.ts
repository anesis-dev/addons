import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, type Profile } from 'passport-discord';
import { OAuthUser } from '../oauth.types';

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, 'discord') {
  constructor() {
    super({
      clientID: process.env.DISCORD_CLIENT_ID ?? '',
      clientSecret: process.env.DISCORD_CLIENT_SECRET ?? '',
      callbackURL:
        process.env.DISCORD_CALLBACK_URL ??
        'http://localhost:3000/auth/discord/callback',
      scope: ['identify', 'email'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: (err: unknown, user?: OAuthUser) => void,
  ): void {
    const user: OAuthUser = {
      provider: 'discord',
      providerId: profile.id,
      email: profile.email ?? null,
      name: profile.username,
      avatarUrl: profile.avatar
        ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
        : null,
    };
    done(null, user);
  }
}
