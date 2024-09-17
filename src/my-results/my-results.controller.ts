import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { MyResultsService } from './my-results.service';
import { IdValidationPipe } from 'src/utils/pipes/id.validation.pipes';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('my-results')
export class MyResultsController {
  constructor(private readonly myResultsService: MyResultsService) {}

  @Get('/:id/my-results')
  findAll(@Param('id', IdValidationPipe) _id: string) {
    return this.myResultsService.getMyResults(_id);
  }

  @Get('/sharedLesson/:id')
  getSelectedSharedLesson(@Param('id', IdValidationPipe) _id: string) {
    return this.myResultsService.getSelectedSharedLesson(_id);
  }

  @Get('/embedded-lesson/:id')
  getEmbeddedLesson(@Param('id', IdValidationPipe) _id: string) {
    return this.myResultsService.getEmbeddedLesson(_id);
  }

  @Post('/:id/wrapUpLesson')
  wrapUpLesson(@Param('id', IdValidationPipe) _id: string, @Body() data: any) {
    return this.myResultsService.wrapUpLesson(_id, data);
  }

  @Patch('/:id/moveLesson')
  @Auth('teacher')
  moveLesson(@Param('id') targetID: string, @Body() draggedID: any) {
    return this.myResultsService.moveLesson(targetID, draggedID);
  }

  @Patch('/:id/moveBackLesson')
  @Auth('teacher')
  moveBackLesson(@Param('id') draggedLessonID: string, @Body() folderID: any) {
    return this.myResultsService.moveBackLesson(draggedLessonID, folderID);
  }
}
