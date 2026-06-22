import { Module } from '@nestjs/common';
import { {{ resource_name_pascal }}Controller } from './{{ resource_name_kebab }}.controller';
import { {{ resource_name_pascal }}Service } from './{{ resource_name_kebab }}.service';

@Module({
  controllers: [{{ resource_name_pascal }}Controller],
  providers: [{{ resource_name_pascal }}Service],
})
export class {{ resource_name_pascal }}Module {}
