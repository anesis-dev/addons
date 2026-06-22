import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OAuthService } from '../oauth.service';
import { OAuthUser } from '../oauth.types';

@Controller('auth/discord')
export class DiscordOAuthController {
  constructor(private readonly oauth: OAuthService) {}

  // GET /auth/discord → Passport redirects the user to Discord's consent screen.
  @Get()
  @UseGuards(AuthGuard('discord'))
  login(): void {}

  // GET /auth/discord/callback → Discord redirects back here after consent.
  @Get('callback')
  @UseGuards(AuthGuard('discord'))
  callback(@Req() req: { user: OAuthUser }) {
    return this.oauth.login(req.user);
  }
}
