import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { {{ resource_name_pascal }}Service } from './{{ resource_name_kebab }}.service';
import { Create{{ resource_name_pascal }}Dto } from './dto/create-{{ resource_name_kebab }}.dto';
import { Update{{ resource_name_pascal }}Dto } from './dto/update-{{ resource_name_kebab }}.dto';

@Controller('{{ resource_name_kebab }}')
export class {{ resource_name_pascal }}Controller {
  constructor(private readonly {{ resource_name_camel }}Service: {{ resource_name_pascal }}Service) {}

  @Post()
  create(@Body() dto: Create{{ resource_name_pascal }}Dto) {
    return this.{{ resource_name_camel }}Service.create(dto);
  }

  @Get()
  findAll() {
    return this.{{ resource_name_camel }}Service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.{{ resource_name_camel }}Service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Update{{ resource_name_pascal }}Dto,
  ) {
    return this.{{ resource_name_camel }}Service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.{{ resource_name_camel }}Service.remove(id);
  }
}
