import { BadRequestException, Injectable } from '@nestjs/common';
import { FolderDto } from './dto/folder.dto';
import { InjectModel } from 'nestjs-typegoose';
import { FolderModel } from './folder.model';
import { ModelType } from '@typegoose/typegoose/lib/types';
import mongoose, { Types } from 'mongoose';

@Injectable()
export class FolderService {
  constructor(
    @InjectModel(FolderModel)
    private readonly FolderModel: ModelType<FolderModel>,
  ) {}

  async createNewFolder(folderDto: FolderDto): Promise<FolderModel> {
    const newFolder = new this.FolderModel({
      _id: new mongoose.Types.ObjectId(),
      ownerID: new mongoose.Types.ObjectId(folderDto.ownerID),
      folderName: folderDto.folderName,
      type: 'folder',
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

  async getChildrenFolders(parentId: string) {
    if (!parentId) {
      throw new Error('parentId is required');
    }

    const folder = await this.FolderModel.find({
      parentID: new Types.ObjectId(parentId),
    }).exec();

    return folder;
  }

  async deleteFolders(data: { foldersID: string | string[] }): Promise<void> {
    try {
      const { foldersID } = data;
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

      await Promise.all(
        folderIDsArray.map((id) => this.deleteFolderAndChildren(id)),
      );
    } catch (error) {
      console.error('Произошла ошибка при удалении папок:', error);
      throw error;
    }
  }

  private async deleteFolderAndChildren(folderId: string): Promise<void> {
    const folder = await this.FolderModel.findById(folderId);
    if (!folder) {
      console.warn(`Папка с ID ${folderId} не найдена`);
      return;
    }

    if (folder.children && folder.children.length > 0) {
      await Promise.all(
        folder.children.map((childId: any) =>
          this.deleteFolderAndChildren(childId),
        ),
      );
    }

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

  async moveEntityInFolder(data: any) {
    return data;
  }
}
