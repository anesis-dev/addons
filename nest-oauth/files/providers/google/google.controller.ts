import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OAuthService } from '../oauth.service';
import { OAuthUser } from '../oauth.types';

@Controller('auth/google')
export class GoogleOAuthController {
  constructor(private readonly oauth: OAuthService) {}

  // GET /auth/google → Passport redirects the user to Google's consent screen.
  @Get()
  @UseGuards(AuthGuard('google'))
  login(): void {}

  // GET /auth/google/callback → Google redirects back here after consent.
  @Get('callback')
  @UseGuards(AuthGuard('google'))
  callback(@Req() req: { user: OAuthUser }) {
    return this.oauth.login(req.user);
  }
}
