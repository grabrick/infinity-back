import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FolderDto } from './dto/folder.dto';
import { InjectModel } from 'nestjs-typegoose';
import { FolderModel } from './folder.model';
import { ModelType } from '@typegoose/typegoose/lib/types';
import mongoose, { Types } from 'mongoose';
import { LessonModel } from 'src/lesson/lesson.model';
import { MyResultsModel } from 'src/my-results/my-results.model';

@Injectable()
export class FolderService {
  constructor(
    @InjectModel(FolderModel)
    private readonly FolderModel: ModelType<FolderModel>,
    @InjectModel(LessonModel)
    private readonly LessonModel: ModelType<LessonModel>,
    @InjectModel(MyResultsModel)
    private readonly MyResultsModel: ModelType<MyResultsModel>,
  ) {}

  async createNewFolder(folderDto: FolderDto) {
    const newFolder = new this.FolderModel({
      _id: new mongoose.Types.ObjectId(),
      ownerID: new mongoose.Types.ObjectId(folderDto.ownerID),
      folderName: folderDto.folderName,
      createdIn: folderDto.createdIn,
      createdAt: Date.now(),
      children: [],
      parentID: folderDto.folderID
        ? new mongoose.Types.ObjectId(folderDto.folderID)
        : null, // Добавляем parentID
    });

    const createNewFolder = await newFolder.save();

    if (folderDto.folderID) {
      const parentFolder = await this.FolderModel.findById(folderDto.folderID);

      if (!parentFolder) {
        console.error(`Parent folder with ID ${folderDto.folderID} not found`);
        throw new Error(
          `Parent folder with ID ${folderDto.folderID} not found`,
        );
      }

      parentFolder.children.push(createNewFolder._id);
      await parentFolder.save();
    }

    return createNewFolder;
  }

  async getCurrentFolder(folderId?: string) {
    if (!folderId) {
      const folder = this.FolderModel.find({ parentID: null }).exec();
      return folder;
    }

    const folder = await this.FolderModel.findById(folderId)
      .populate('children')
      .exec();

    if (!folder) {
      throw new Error(`Folder with ID ${folderId} not found`);
    }

    return folder;
  }

  async getRootFolders(): Promise<FolderModel[]> {
    return this.FolderModel.find({ parentID: null }).exec();
  }

  async getChildrens(parentId: string) {
    if (!parentId) {
      throw new Error('parentId is required');
    }

    const folder = await this.FolderModel.find({
      parentID: new Types.ObjectId(parentId),
    }).exec();

    const lesson = await this.LessonModel.find({
      parentID: new Types.ObjectId(parentId),
    }).exec();
    if (lesson.length === 0) {
      const resultsLesson = await this.MyResultsModel.find({
        parentID: new Types.ObjectId(parentId),
      }).exec();
      return {
        folder: folder,
        lesson: resultsLesson,
      };
    } else {
      return {
        folder: folder,
        lesson: lesson,
      };
    }
  }

  async deleteFolders(data: {
    foldersID: string | string[];
    folderID: string;
  }) {
    try {
      const { foldersID, folderID } = data;
      let folderIDsArray: string[];

      if (typeof foldersID === 'string') {
        folderIDsArray = [foldersID];
      } else if (Array.isArray(foldersID)) {
        folderIDsArray = foldersID;
      } else {
        throw new BadRequestException(
          'foldersID должен быть строкой или массивом строк',
        );
      }

      if (folderID) {
        await Promise.all(
          folderIDsArray.map(
            async (id) =>
              await this.FolderModel.findByIdAndUpdate(
                { _id: folderID },
                {
                  $pull: { children: id },
                },
              ),
          ),
        );
      }

      await Promise.all(
        folderIDsArray.map((id) => this.deleteFolderAndChildren(id)),
      );
    } catch (error) {
      console.error('Произошла ошибка при удалении папок:', error);
      throw error;
    }
  }

  private async deleteFolderAndChildren(folderId: string) {
    const folder = await this.FolderModel.findById(folderId);

    if (!folder) {
      // Папка не найдена, возможно это урок
      const lesson = await this.LessonModel.findById(folderId);
      if (lesson) {
        // Если это урок, удаляем его
        await this.LessonModel.findByIdAndDelete(folderId);
      }
      return;
    }

    // Удаляем все дочерние элементы (если они есть)
    if (folder.children && folder.children.length > 0) {
      await Promise.all(
        folder.children.map((childId: any) =>
          this.deleteFolderAndChildren(childId),
        ),
      );
    }

    // Удаляем текущую папку
    await this.FolderModel.findByIdAndDelete(folderId);
  }

  async renameFolder(folderID: string, folderName: any) {
    const folder = await this.FolderModel.findByIdAndUpdate(
      { _id: folderID },
      {
        folderName: folderName.folderName,
      },
    );

    return folder;
  }

  async moveFolder(targetID: string, draggedID: { draggedID: string }) {
    const findTargetFolder = await this.FolderModel.findById(targetID);
    const findDraggedFolder = await this.FolderModel.findById(
      draggedID.draggedID,
    );

    if (!findTargetFolder) {
      throw new NotFoundException(`Такой папки не существует`);
    }

    if (!findDraggedFolder) {
      throw new NotFoundException(`Такой элемент не существует`);
    }

    // Проверка на наличие уже существующего child ID
    if (!findTargetFolder.children.includes(findDraggedFolder._id)) {
      findTargetFolder.children.push(findDraggedFolder._id);
    }

    // console.log({ targetID: targetID, draggedID: draggedID.draggedID });

    await this.FolderModel.findByIdAndUpdate(
      draggedID.draggedID,
      {
        parentID: targetID,
      },
      { new: true },
    );

    await findTargetFolder.save();
  }

  async moveBackFolder(
    draggedFolderID: string,
    folderID: { folderID: string },
  ) {
    const findRootFolder = await this.FolderModel.findById(folderID.folderID);

    if (!findRootFolder) {
      throw new NotFoundException(
        'Нет папки в которую можно перекинуть элемент',
      );
    }

    const findDraggedFolder = await this.FolderModel.findById(draggedFolderID);

    if (findRootFolder.parentID === null) {
      // Устанавливаем parentID на null для перетаскиваемой папки
      await this.FolderModel.findByIdAndUpdate(
        { _id: findDraggedFolder._id },
        {
          parentID: null,
        },
      );

      // Удаляем перетаскиваемую папку из children её предыдущего родителя
      await this.FolderModel.findByIdAndUpdate(
        { _id: findDraggedFolder.parentID },
        {
          $pull: { children: findDraggedFolder._id },
        },
      );
    } else {
      // Устанавливаем parentID перетаскиваемой папки на id корневой папки
      await this.FolderModel.findByIdAndUpdate(
        { _id: findDraggedFolder._id },
        {
          parentID: findRootFolder.parentID,
        },
      );

      // Добавляем перетаскиваемую папку в children корневой папки
      await this.FolderModel.findByIdAndUpdate(
        { _id: findRootFolder._id },
        {
          $addToSet: { children: findDraggedFolder._id },
        },
      );

      // Удаляем перетаскиваемую папку из children её предыдущего родителя
      await this.FolderModel.findByIdAndUpdate(
        { _id: findDraggedFolder.parentID },
        {
          $pull: { children: findDraggedFolder._id },
        },
      );
    }
  }
}
