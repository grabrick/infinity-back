import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { LessonService } from './lesson.service';
import { LessonDto } from './dto/lesson.dto';

@Controller('lesson')
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @Post('/create')
  createLessons(@Body() lessonDto: LessonDto) {
    return this.lessonService.createNewLessons(lessonDto);
  }

  @Get()
  findAll() {
    return this.lessonService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lessonService.findOne(+id);
  }
}
