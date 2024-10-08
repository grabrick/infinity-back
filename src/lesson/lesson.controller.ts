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
  UsePipes,
  ValidationPipe,
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
  @UsePipes(new ValidationPipe())
  findSelectedByID(@Param('id') _id: string) {
    return this.lessonService.findSelectedById(_id);
  }

  @Get('/playLesson/:id')
  @UsePipes(new ValidationPipe())
  getPlayLessonById(@Param('id') _id: string) {
    return this.lessonService.getPlayLessonById(_id);
  }

  @Post('/create')
  @Auth('teacher')
  createLessons(@Body() lessonDto: LessonDto) {
    return this.lessonService.createNewLessons(lessonDto);
  }

  @Put('/:id/saveLesson')
  @Auth('teacher')
  saveLesson(@Param('id') lessonID, @Body() data: any) {
    return this.lessonService.saveLesson(lessonID, data);
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

  @Post('uploadMusic')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async uploadMusicFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() lessonID: any,
  ) {
    return this.lessonService.saveMusicFile(file, lessonID.lessonID);
  }

  @Post('uploadSounds')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async uploadSoundsFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() data: any,
  ) {
    return this.lessonService.saveSoundsFile(file, data);
  }

  @Put('/:id/saveSettings')
  @Auth('teacher')
  saveLessonSetting(@Param('id') lessonID: string, @Body() data: any) {
    return this.lessonService.saveLessonSettings(lessonID, data);
  }

  @Put('/:name/deleteMusic')
  @Auth('teacher')
  deleteMusicFile(@Param('name') fileName: string, @Body() lessonID: any) {
    return this.lessonService.deleteMusicFile(fileName, lessonID);
  }

  @Put('/:name/deleteSound')
  @Auth('teacher')
  deleteSoundFile(@Param('name') fileName: string, @Body() lessonID: any) {
    return this.lessonService.deleteSoundFile(fileName, lessonID);
  }

  @Patch('/createShareUrl')
  @Auth('teacher')
  createShareUrl(@Body() data: any) {
    return this.lessonService.createShareUrl(data);
  }
}
