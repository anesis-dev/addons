import { Injectable } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

@Injectable()
export class DrizzleService {
  public readonly db: NodePgDatabase<typeof schema>;

  constructor() {
    this.db = drizzle(process.env.DATABASE_URL!, { schema });
  }
}
