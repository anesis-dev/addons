import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OAuthService } from '../oauth.service';
import { OAuthUser } from '../oauth.types';

@Controller('auth/github')
export class GithubOAuthController {
  constructor(private readonly oauth: OAuthService) {}

  // GET /auth/github → Passport redirects the user to GitHub's consent screen.
  @Get()
  @UseGuards(AuthGuard('github'))
  login(): void {}

  // GET /auth/github/callback → GitHub redirects back here after consent.
  @Get('callback')
  @UseGuards(AuthGuard('github'))
  callback(@Req() req: { user: OAuthUser }) {
    return this.oauth.login(req.user);
  }
}
