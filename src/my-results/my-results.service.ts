import { Injectable } from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { FolderModel } from 'src/folder/folder.model';
import { LessonModel } from 'src/lesson/lesson.model';
import { MyResultsModel } from './my-results.model';

@Injectable()
export class MyResultsService {
  constructor(
    @InjectModel(FolderModel)
    private readonly FolderModel: ModelType<FolderModel>,
    @InjectModel(LessonModel)
    private readonly LessonModel: ModelType<LessonModel>,
    @InjectModel(MyResultsModel)
    private readonly MyResultsModel: ModelType<MyResultsModel>,
  ) {}

  async getMyResults(_id: any) {
    const folder = await this.FolderModel.find({
      ownerID: _id,
      parentID: null,
      createdIn: { $ne: 'activity' },
    });
    const sharedLesson = await this.MyResultsModel.find({
      ownerID: _id,
      parentID: null,
    });

    return { folder, sharedLesson };
  }
}
