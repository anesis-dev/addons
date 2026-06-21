import { Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DrizzleService } from '../db/drizzle.service';
import {
  {{ resource_name_snake }}Table,
  type {{ resource_name_pascal }},
  type New{{ resource_name_pascal }},
} from './{{ resource_name_kebab }}.schema';
import { Create{{ resource_name_pascal }}Dto } from './dto/create-{{ resource_name_kebab }}.dto';
import { Update{{ resource_name_pascal }}Dto } from './dto/update-{{ resource_name_kebab }}.dto';

@Injectable()
export class {{ resource_name_pascal }}Service {
  constructor(private readonly drizzle: DrizzleService) {}

  async findAll(): Promise<{{ resource_name_pascal }}[]> {
    return this.drizzle.db.select().from({{ resource_name_snake }}Table);
  }

  async findOne(id: number): Promise<{{ resource_name_pascal }}> {
    const [row] = await this.drizzle.db
      .select()
      .from({{ resource_name_snake }}Table)
      .where(eq({{ resource_name_snake }}Table.id, id))
      .limit(1);

    if (!row) throw new NotFoundException(`{{ resource_name_pascal }} #${id} not found`);
    return row;
  }

  async create(dto: Create{{ resource_name_pascal }}Dto): Promise<{{ resource_name_pascal }}> {
    const [created] = await this.drizzle.db
      .insert({{ resource_name_snake }}Table)
      .values(dto as New{{ resource_name_pascal }})
      .returning();
    return created;
  }

  async update(id: number, dto: Update{{ resource_name_pascal }}Dto): Promise<{{ resource_name_pascal }}> {
    const [updated] = await this.drizzle.db
      .update({{ resource_name_snake }}Table)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq({{ resource_name_snake }}Table.id, id))
      .returning();

    if (!updated) throw new NotFoundException(`{{ resource_name_pascal }} #${id} not found`);
    return updated;
  }

  async remove(id: number): Promise<void> {
    await this.drizzle.db
      .delete({{ resource_name_snake }}Table)
      .where(eq({{ resource_name_snake }}Table.id, id));
  }
}
