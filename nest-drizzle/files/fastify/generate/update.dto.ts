import { PartialType } from '@nestjs/mapped-types';
import { Create{{ resource_name_pascal }}Dto } from './create-{{ resource_name_kebab }}.dto';

export class Update{{ resource_name_pascal }}Dto extends PartialType(Create{{ resource_name_pascal }}Dto) {}
