import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions';
import { InjectModel } from 'nestjs-typegoose';
import { UserModel } from './user.model';
import { ModelType } from '@typegoose/typegoose/lib/types';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserModel) private readonly UserModel: ModelType<UserModel>,
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

  async delete(id: string) {
    return this.UserModel.findByIdAndDelete(id).exec();
  }
}
