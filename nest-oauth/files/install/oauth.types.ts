// Normalized user shape produced by every OAuth strategy.
// Each provider strategy maps its own profile into this interface.
export interface OAuthUser {
  provider: string;
  providerId: string;
  email: string | null;
  name?: string;
  avatarUrl?: string | null;
}
