import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { type Response } from 'express';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ConfigService } from '@nestjs/config';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { RefreshTokenGuard } from './guards/refresh-token.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @Post('register')
  async register(@Body() body: RegisterDto, @Res() res: Response) {
    const { user, accessToken, refreshToken } =
      await this.authService.register(body);
    this.setCookies(res, { accessToken, refreshToken });

    res.status(201).send({ user });
  }

  @Public()
  @Post('login')
  async login(@Body() body: LoginDto, @Res() res: Response) {
    const { user, accessToken, refreshToken } =
      await this.authService.login(body);
    this.setCookies(res, { accessToken, refreshToken });

    res.status(200).send({ user });
  }

  @Get('me')
  me(@CurrentUser('userId') userId: string) {
    return this.authService.me(userId);
  }

  @Post('logout')
  async logout(@CurrentUser('userId') userId: string, @Res() res: Response) {
    await this.authService.logout(userId);
    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/auth/refresh' });
    res.status(200).send({ message: 'Logged out successfully' });
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  async refresh(
    @CurrentUser() user: { userId: string; refreshToken: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.refresh(
      user.userId,
      user.refreshToken,
    );
    this.setCookies(res, tokens);
    return { message: 'ok' };
  }

  private setCookies(
    res: Response,
    tokens: { accessToken: string; refreshToken: string },
  ) {
    const isProd = process.env.NODE_ENV === 'production';

    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
      path: '/',
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/auth/refresh',
    });
  }
}
