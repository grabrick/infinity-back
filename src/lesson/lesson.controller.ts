import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Put,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { LessonService } from './lesson.service';
import { multerOptions } from '../utils/config/multer.config';
import { FileInterceptor } from '@nestjs/platform-express';
import { LessonDto } from './dto/lesson.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('lesson')
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @Get('/:id/find')
  findByID(@Param('id') _id: string) {
    return this.lessonService.findById(_id);
  }

  @Get('/:id')
  findSelectedByID(@Param('id') _id: string) {
    return this.lessonService.findSelectedById(_id);
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

  @Patch('/:id/moveLesson')
  @Auth('teacher')
  moveLesson(@Param('id') targetID: string, @Body() draggedID: any) {
    return this.lessonService.moveLesson(targetID, draggedID);
  }

  @Patch('/:id/moveBackLesson')
  @Auth('teacher')
  moveBackLesson(@Param('id') draggedLessonID: string, @Body() folderID: any) {
    return this.lessonService.moveBackLesson(draggedLessonID, folderID);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.lessonService.saveFile(file);
  }

  @Put('/:id/saveSettings')
  @Auth('teacher')
  saveLessonSetting(@Param('id') lessonID: string, @Body() data: any) {
    return this.lessonService.saveLessonSettings(lessonID, data);
  }

  // @Put('/:id/saveMusic')
  // @Auth('teacher')
  // saveLessonMusic(@Param('id') lessonID: string, @Body() data: any) {
  //   return this.lessonService.saveLessonMusic(lessonID, data);
  // }
}
