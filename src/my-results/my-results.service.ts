import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { FolderModel } from 'src/folder/folder.model';
import { LessonModel } from 'src/lesson/lesson.model';
import { MyResultsModel } from './my-results.model';
import { Types } from 'mongoose';

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

  async getEmbeddedLesson(_id: any) {
    const findShared = await this.MyResultsModel.findById(_id);
    if (!findShared) {
      throw new NotFoundException('Урок не найден');
    }

    return findShared;
  }

  async getSelectedSharedLesson(_id: any) {
    const findShared = await this.MyResultsModel.findById(_id);
    if (!findShared) {
      throw new NotFoundException('Урок не найден');
    }

    const findOriginLesson = await this.LessonModel.findById(
      findShared.lessonID,
    );
    if (!findOriginLesson) {
      throw new NotFoundException('Урок не найден');
    }

    return { shared: findShared, originLesson: findOriginLesson };
  }

  async addedName(_id: string, data: any) {
    const findOriginLesson = await this.LessonModel.findById(_id);
    const findSharedLesson = await this.MyResultsModel.findOne({
      lessonID: _id,
    });
    if (!findOriginLesson) {
      throw new NotFoundException('Оригинал урока не найден');
    }
    if (!findSharedLesson) {
      throw new NotFoundException('Урока не найден');
    }
    const addedNewUser = await this.MyResultsModel.updateOne(
      { lessonID: _id },
      {
        visitCount: ++findSharedLesson.visitCount,
        $push: {
          users: {
            $each: [
              {
                userName: data.userName,
                userID:
                  data.userID !== null ? new Types.ObjectId(data.userID) : null,
                correct: data.correct,
                incorrect: data.incorrect,
                selectedAnswers: data.selectedAnswers,
                createdAt: new Date(),
              },
            ],
          },
        },
      },
      { upsert: true },
    );
    return addedNewUser;
  }

  async moveLesson(targetID: string, draggedID: { draggedID: string }) {
    const findTargetFolder = await this.FolderModel.findById(targetID);
    const findDraggedLesson = await this.LessonModel.findById(
      draggedID.draggedID,
    );

    if (!findTargetFolder) {
      throw new NotFoundException(`Такой папки не существует`);
    }

    if (!findDraggedLesson) {
      throw new NotFoundException(`Такой элемент не существует`);
    }

    findTargetFolder.children.push(findDraggedLesson._id);

    // Сохранить изменения в папке
    await findTargetFolder.save();

    await this.LessonModel.findByIdAndUpdate(
      draggedID.draggedID,
      {
        parentID: targetID,
      },
      { new: true },
    );
  }

  async moveBackLesson(
    draggedLessonID: string,
    folderID: { folderID: string },
  ) {
    const findRootFolder = await this.FolderModel.findById(folderID.folderID);

    if (!findRootFolder) {
      throw new NotFoundException(
        'Нет папки в которую можно перекинуть элемент',
      );
    }

    const findDraggedLesson = await this.LessonModel.findById(draggedLessonID);
    if (findRootFolder.parentID === null) {
      await this.LessonModel.findByIdAndUpdate(
        { _id: findDraggedLesson._id },
        {
          parentID: null,
        },
      );

      await this.FolderModel.findByIdAndUpdate(
        { _id: findDraggedLesson.parentID },
        {
          $pull: { children: findDraggedLesson._id },
        },
      );
    } else {
      // Устанавливаем parentID перетаскиваемой папки на id корневой папки
      await this.LessonModel.findByIdAndUpdate(
        { _id: findDraggedLesson._id },
        {
          parentID: findRootFolder.parentID,
        },
      );

      // Добавляем перетаскиваемую папку в children корневой папки
      await this.FolderModel.findByIdAndUpdate(
        { _id: findRootFolder._id },
        {
          $addToSet: { children: findDraggedLesson._id },
        },
      );

      // Удаляем перетаскиваемую папку из children её предыдущего родителя
      await this.FolderModel.findByIdAndUpdate(
        { _id: findDraggedLesson.parentID },
        {
          $pull: { children: findDraggedLesson._id },
        },
      );
    }
  }
}
