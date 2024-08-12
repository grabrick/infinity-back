import { PartialType } from '@nestjs/swagger';
import { CreateMyResultDto } from './create-my-result.dto';

export class UpdateMyResultDto extends PartialType(CreateMyResultDto) {}
