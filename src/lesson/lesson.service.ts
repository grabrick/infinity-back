import { Injectable } from '@nestjs/common';
import { LessonDto } from './dto/lesson.dto';
import { InjectModel } from 'nestjs-typegoose';
import { LessonModel } from './lesson.model';
import { ModelType } from '@typegoose/typegoose/lib/types';
import mongoose from 'mongoose';

@Injectable()
export class LessonService {
  constructor(
    @InjectModel(LessonModel)
    private readonly LessonModel: ModelType<LessonModel>,
  ) {}
  async createNewLessons(lessonDto: LessonDto) {
    const create = new this.LessonModel({
      _id: new mongoose.Types.ObjectId(),
      ownerID: lessonDto.ownerID,
      lessonName: lessonDto.lessonName,
      template: lessonDto.template,
    });

    const createNewFolder = await create.save();
    return createNewFolder;
  }

  findAll() {
    return `This action returns all lesson`;
  }

  findOne(id: number) {
    return `This action returns a #${id} lesson`;
  }
}
