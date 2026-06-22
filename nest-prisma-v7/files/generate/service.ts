import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Create{{ resource_name_pascal }}Dto } from './dto/create-{{ resource_name_kebab }}.dto';
import { Update{{ resource_name_pascal }}Dto } from './dto/update-{{ resource_name_kebab }}.dto';

@Injectable()
export class {{ resource_name_pascal }}Service {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.{{ resource_name_camel }}.findMany();
  }

  async findOne(id: number) {
    const item = await this.prisma.{{ resource_name_camel }}.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`{{ resource_name_pascal }} #${id} not found`);
    return item;
  }

  create(dto: Create{{ resource_name_pascal }}Dto) {
    return this.prisma.{{ resource_name_camel }}.create({ data: dto });
  }

  async update(id: number, dto: Update{{ resource_name_pascal }}Dto) {
    try {
      return await this.prisma.{{ resource_name_camel }}.update({ where: { id }, data: dto });
    } catch {
      throw new NotFoundException(`{{ resource_name_pascal }} #${id} not found`);
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.{{ resource_name_camel }}.delete({ where: { id } });
    } catch {
      throw new NotFoundException(`{{ resource_name_pascal }} #${id} not found`);
    }
  }
}
