import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { LessonDto } from './dto/lesson.dto';
import { InjectModel } from 'nestjs-typegoose';
import { LessonModel } from './lesson.model';
import { ModelType } from '@typegoose/typegoose/lib/types';
import mongoose, { Types } from 'mongoose';
import { FolderModel } from 'src/folder/folder.model';
import * as fs from 'fs';
import * as path from 'path';
import { MyResultsModel } from 'src/my-results/my-results.model';

@Injectable()
export class LessonService {
  private readonly logger = new Logger(LessonService.name);
  constructor(
    @InjectModel(LessonModel)
    private readonly LessonModel: ModelType<LessonModel>,
    @InjectModel(FolderModel)
    private readonly FolderModel: ModelType<FolderModel>,
    @InjectModel(MyResultsModel)
    private readonly MyResultsModel: ModelType<MyResultsModel>,
  ) {}

  async findById(_id: string) {
    const findSelectedLesson = await this.LessonModel.findById(_id);
    return findSelectedLesson;
  }

  async findSelectedById(_id: string) {
    if (!Types.ObjectId.isValid(_id)) {
      throw new NotFoundException('Урок не найден');
    }

    const findSelectedLesson = await this.LessonModel.findById(_id);
    if (!findSelectedLesson) {
      throw new NotFoundException('Урок не найден');
    }

    return findSelectedLesson;
  }

  async getPlayLessonById(_id: string) {
    const findShared = await this.MyResultsModel.findOne({
      lessonID: _id,
    });

    return findShared;
  }

  async createNewLessons(lessonDto: LessonDto) {
    const create = new this.LessonModel({
      _id: new mongoose.Types.ObjectId(),
      ownerID: lessonDto.ownerID,
      lessonName: lessonDto.lessonName,
      desc: lessonDto.desc,
      template: lessonDto.template,
    });

    const createNewFolder = await create.save();
    return createNewFolder;
  }

  async saveLesson(lessonID: string, data: any) {
    const findLesson = await this.LessonModel.findById(lessonID);
    if (!findLesson) {
      throw new NotFoundException('Урок не найден');
    }
    const handleSave = await this.LessonModel.updateOne(
      { _id: lessonID },
      { questions: data.data },
      { upsert: true },
    );

    return handleSave;
  }

  async deleteSelectedIssue(issueID: string) {
    const lesson = await this.LessonModel.findOneAndUpdate(
      {
        'questions._id': issueID,
      },
      {
        $pull: {
          questions: { _id: issueID },
        },
      },
      {
        new: true,
      },
    );

    return lesson;
  }

  // async delete(lessonID: string) {
  //   // const lesson = await this.LessonModel.findByIdAndDelete(lessonID);
  //   const lesson = await this.LessonModel.findById(lessonID);

  //   if (!lesson) {
  //     throw new NotFoundException('Такой папки не существует');
  //   }
  //   if (lesson.lessonSettings.soundboard.music) {
  //     const currentDir = process.cwd();
  //     const uploadsDir = path.join(currentDir, 'uploads');

  //     if (!fs.existsSync(uploadsDir)) {
  //       fs.mkdirSync(uploadsDir, { recursive: true });
  //     }

  //     const files = fs.readdirSync(uploadsDir);
  //     this.logger.log(`Files in uploads directory: ${files.join(', ')}`);

  //     const filePath = path.join(
  //       uploadsDir,
  //       lesson.lessonSettings.soundboard.music.file.fileName,
  //     );

  //     if (fs.existsSync(filePath)) {
  //       fs.unlinkSync(filePath);
  //     }
  //   }

  //   return lesson;
  // }

  async delete(lessonID: string) {
    // Получаем урок по ID
    const lesson = await this.LessonModel.findById(lessonID);

    if (!lesson) {
      throw new NotFoundException('Такого урока не существует');
    }

    const currentDir = process.cwd();
    const uploadsDir = path.join(currentDir, 'uploads');

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Удаление музыкального файла, если он существует
    if (
      lesson.lessonSettings.soundboard.music &&
      lesson.lessonSettings.soundboard.music.file &&
      lesson.lessonSettings.soundboard.music.file.fileName
    ) {
      const musicFilePath = path.join(
        uploadsDir,
        lesson.lessonSettings.soundboard.music.file.fileName,
      );

      if (fs.existsSync(musicFilePath)) {
        fs.unlinkSync(musicFilePath);
        this.logger.log(
          `Музыкальный файл ${lesson.lessonSettings.soundboard.music.file.fileName} удален.`,
        );
      }
    }

    // Удаление всех звуков из массива sounds
    if (
      lesson.lessonSettings.soundboard.sounds &&
      lesson.lessonSettings.soundboard.sounds.length > 0
    ) {
      lesson.lessonSettings.soundboard.sounds.forEach((sound) => {
        // Проверяем наличие file и fileName в объекте audioFile
        if (
          sound.audioFile &&
          sound.audioFile.file &&
          sound.audioFile.file.fileName
        ) {
          const soundFilePath = path.join(
            uploadsDir,
            sound.audioFile.file.fileName,
          );

          if (fs.existsSync(soundFilePath)) {
            fs.unlinkSync(soundFilePath);
            this.logger.log(
              `Аудиофайл ${sound.audioFile.file.fileName} удален.`,
            );
          }
        } else {
          this.logger.warn(
            `Аудиофайл для звука с ID ${sound.id} отсутствует или не имеет fileName`,
          );
        }
      });
    }

    // После удаления всех файлов удаляем сам урок из базы данных
    await this.LessonModel.findByIdAndDelete(lessonID);

    return lesson;
  }

  async moveLesson(targetID: string, draggedID: { draggedID: string }) {
    const findTargetFolder = await this.FolderModel.findById(targetID);
    const findDraggedLesson = await this.LessonModel.findById(
      draggedID.draggedID,
    );
    const findSharedLesson = await this.MyResultsModel.findById(
      draggedID.draggedID,
    );

    if (!findTargetFolder) {
      throw new NotFoundException(`Такой папки не существует`);
    }

    if (!findDraggedLesson) {
      // throw new NotFoundException(`Такой элемент не существует`);
      findTargetFolder.children.push(findSharedLesson._id);

      // Сохранить изменения в папке
      await findTargetFolder.save();

      await this.MyResultsModel.findByIdAndUpdate(
        draggedID.draggedID,
        {
          parentID: targetID,
        },
        { new: true },
      );
    } else {
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
    if (!findDraggedLesson) {
      const findSharedLesson =
        await this.MyResultsModel.findById(draggedLessonID);
      if (findRootFolder.parentID === null) {
        await this.MyResultsModel.findByIdAndUpdate(
          { _id: findSharedLesson._id },
          {
            parentID: null,
          },
        );

        await this.FolderModel.findByIdAndUpdate(
          { _id: findSharedLesson.parentID },
          {
            $pull: { children: findSharedLesson._id },
          },
        );
      } else {
        // Устанавливаем parentID перетаскиваемой папки на id корневой папки
        await this.MyResultsModel.findByIdAndUpdate(
          { _id: findSharedLesson._id },
          {
            parentID: findRootFolder.parentID,
          },
        );

        // Добавляем перетаскиваемую папку в children корневой папки
        await this.FolderModel.findByIdAndUpdate(
          { _id: findRootFolder._id },
          {
            $addToSet: { children: findSharedLesson._id },
          },
        );

        // Удаляем перетаскиваемую папку из children её предыдущего родителя
        await this.FolderModel.findByIdAndUpdate(
          { _id: findSharedLesson.parentID },
          {
            $pull: { children: findSharedLesson._id },
          },
        );
      }
    } else {
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

  async saveMusicFile(file: Express.Multer.File, lessonID: string) {
    const findLesson = await this.LessonModel.findById(lessonID);
    if (!findLesson) {
      throw new NotFoundException('Урок не найден');
    }

    const updateData = {
      'lessonSettings.soundboard.music': {
        file: {
          fileName: file.filename,
          size: file.size,
          originalName: file.originalname,
          mimeType: file.mimetype,
        },
        fileUrl: file.path,
      },
    };

    await this.LessonModel.findByIdAndUpdate(
      { _id: lessonID },
      { $set: updateData },
      { new: true },
    );

    return file;
  }

  async saveSoundsFile(file: Express.Multer.File, data: any) {
    const findLesson = await this.LessonModel.findById(data.lessonID);
    if (!findLesson) {
      throw new NotFoundException('Урок не найден');
    }

    const updateData = {
      $push: {
        'lessonSettings.soundboard.sounds': {
          id: Number(data.data.id),
          name: data.data.name,
          audioFile: {
            file: {
              fileName: file.filename,
              size: file.size,
              originalName: file.originalname,
              mimeType: file.mimetype,
            },
            fileUrl: file.path,
          },
        },
      },
    };

    await this.LessonModel.findByIdAndUpdate(data.lessonID, updateData, {
      new: true,
    });

    return { file, data };
  }

  async deleteMusicFile(fileName: string, lessonID: any) {
    const findLesson = await this.LessonModel.findById(lessonID.lessonID);
    if (!findLesson) {
      throw new NotFoundException('Урок не найден');
    }

    const currentDir = process.cwd();
    const uploadsDir = path.join(currentDir, 'uploads');

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const files = fs.readdirSync(uploadsDir);
    this.logger.log(`Files in uploads directory: ${files.join(', ')}`);

    const filePath = path.join(uploadsDir, fileName);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    } else {
      throw new NotFoundException('Файл не найден');
    }

    await this.LessonModel.findByIdAndUpdate(
      lessonID.lessonID,
      { 'lessonSettings.soundboard.music': null },
      { new: true },
    );

    return {
      fileName: fileName,
      lessonID: lessonID.lessonID,
      filePath: filePath,
    };
  }

  async deleteSoundFile(fileName: string, lessonID: any) {
    try {
      const lesson = await this.LessonModel.findById(lessonID.lessonID);

      if (!lesson) {
        this.logger.error('Lesson not found');
        throw new NotFoundException('Урок не найден');
      }

      lesson.lessonSettings.soundboard.sounds =
        lesson.lessonSettings.soundboard.sounds.filter(
          (sound) => sound.audioFile.file.fileName !== fileName,
        );

      const updatedLesson = await lesson.save();

      const currentDir = process.cwd();
      const uploadsDir = path.join(currentDir, 'uploads');
      const filePath = path.join(uploadsDir, fileName);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        this.logger.log('File deleted successfully');
      } else {
        this.logger.warn('File not found in filesystem');
      }

      this.logger.log('Database updated successfully');

      return {
        message: 'Файл успешно удален',
        fileName: fileName,
        lessonID: lessonID.lessonID,
        lesson: updatedLesson,
      };
    } catch (error) {
      this.logger.error('Error in deleteSoundFile:', error);
      throw new InternalServerErrorException(
        'Произошла ошибка при удалении файла',
      );
    }
  }

  async saveLessonSettings(lessonID, data) {
    const findLesson = await this.LessonModel.findById(lessonID);
    if (!findLesson) {
      throw new NotFoundException('Урок не найден');
    }

    const updateData = {
      'lessonSettings.timer': data.lessonSettings.timer,
      'lessonSettings.limitOnLives': data.lessonSettings.limitOnLives,
      'lessonSettings.shuffling': data.lessonSettings.shuffling,
      'lessonSettings.labeling': data.lessonSettings.labeling,
      'lessonSettings.endGame': data.lessonSettings.endGame,
      'lessonSettings.symbol': data.lessonSettings.symbol,
      'lessonSettings.leaderboard': data.lessonSettings.leaderboard,
      'lessonSettings.soundboard.sounds': data.lessonSettings.soundboard.sounds,
      'lessonSettings.soundboard.music': data.lessonSettings.soundboard.music,
      'lessonSettings.access': data.lessonSettings.access,
      'lessonSettings.privacy': data.lessonSettings.privacy,
    };

    const saved = await this.LessonModel.findByIdAndUpdate(
      { _id: lessonID },
      { $set: updateData },
      { new: true },
    );

    return saved;
  }

  async createShareUrl(data: any) {
    const findLesson = await this.LessonModel.findById(
      data.data?.lessonData?._id,
    );
    if (!findLesson) {
      throw new NotFoundException('Урок не найден');
    }

    const save = await this.LessonModel.findByIdAndUpdate(
      { _id: data.data?.lessonData?._id },
      {
        $set: {
          sharedPlayUrl: data.data?.sharedPlayUrl,
        },
      },
      { new: true },
    );

    const create = new this.MyResultsModel({
      _id: new mongoose.Types.ObjectId(),
      ownerID: data.data?.lessonData?.ownerID,
      lessonID: data.data?.lessonData?._id,
      lessonName: data.data?.lessonData?.lessonName,
      desc: data.data?.lessonData?.desc,
      template: data.data?.lessonData?.template,
      questions: findLesson.questions,
      lessonSettings: findLesson.lessonSettings,
    });
    await create.save();

    return save;
  }
}
