import { Controller, Get, Param } from '@nestjs/common';
import { MyResultsService } from './my-results.service';
import { IdValidationPipe } from 'src/utils/pipes/id.validation.pipes';

@Controller('my-results')
export class MyResultsController {
  constructor(private readonly myResultsService: MyResultsService) {}

  @Get('/:id/my-results')
  findAll(@Param('id', IdValidationPipe) _id: string) {
    return this.myResultsService.getMyResults(_id);
  }
}
