/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions';
import { InjectModel } from 'nestjs-typegoose';
import { UserModel } from './user.model';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { FolderModel } from 'src/folder/folder.model';
import { LessonModel } from 'src/lesson/lesson.model';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserModel) private readonly UserModel: ModelType<UserModel>,
    @InjectModel(FolderModel) private readonly FolderModel: ModelType<FolderModel>,
    @InjectModel(LessonModel) private readonly LessonModel: ModelType<LessonModel>,
  ) {}

  async byId(_id: string) {
    const user = await this.UserModel.findById(_id);
    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async editProfile(_id: string, data: any) {
    const findUser = await this.byId(_id);
    if (!findUser) throw new NotFoundException('User not found');

    const findUserAndUpdate = await this.UserModel.findByIdAndUpdate(
      { _id: _id },
      {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        middleName: data.middleName,
        country: data.country,
        birthday: data.birthday,
      },
      { new: true },
    );

    return findUserAndUpdate;
  }

  async getMyActivity(_id: string) {
    const folder = await this.FolderModel.find({ ownerID: _id, parentID: null });
    const lesson = await this.LessonModel.find({ ownerID: _id, parentID: null });
    
    return {folder, lesson};
  }

  async delete(id: string) {
    return this.UserModel.findByIdAndDelete(id).exec();
  }
}
