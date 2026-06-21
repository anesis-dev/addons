import { pgTable, serial, timestamp } from 'drizzle-orm/pg-core';

export const {{ resource_name_snake }}Table = pgTable('{{ resource_name_snake }}', {
  id: serial('id').primaryKey(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type {{ resource_name_pascal }} = typeof {{ resource_name_snake }}Table.$inferSelect;
export type New{{ resource_name_pascal }} = typeof {{ resource_name_snake }}Table.$inferInsert;
