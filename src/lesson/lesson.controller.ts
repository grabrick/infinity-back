import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { LessonService } from './lesson.service';
import { LessonDto } from './dto/lesson.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('lesson')
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @Get('/:id/find')
  findByID(@Param('id') _id: string) {
    return this.lessonService.findById(_id);
  }

  @Post('/create')
  @Auth('teacher')
  createLessons(@Body() lessonDto: LessonDto) {
    return this.lessonService.createNewLessons(lessonDto);
  }

  @Post('/:id/create-issue')
  @Auth('teacher')
  createIssue(@Param('id') lessonID) {
    return this.lessonService.createIssue(lessonID);
  }

  @Patch('/:id/change-current')
  @Auth('teacher')
  changeCurrent(@Param('id') issueID: string, @Body() data: any) {
    return this.lessonService.changeCurrent(issueID, data);
  }

  @Delete('/:id/delete-issue')
  @Auth('teacher')
  deleteSelectedIssue(@Param() lessonID: { id: string }) {
    return this.lessonService.deleteSelectedIssue(lessonID.id);
  }

  @Delete('/delete-lesson/:id')
  @Auth('teacher')
  deleteLesson(@Param() lessonID: { id: string }) {
    return this.lessonService.delete(lessonID.id);
  }
}
