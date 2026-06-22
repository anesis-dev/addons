import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
// anesis:oauth-imports
import { OAuthService } from './oauth.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'change-me-in-production',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN ?? '7d' },
    }),
  ],
  controllers: [
    // anesis:oauth-controllers
  ],
  providers: [
    OAuthService,
    // anesis:oauth-providers
  ],
  exports: [OAuthService],
})
export class OAuthModule {}
