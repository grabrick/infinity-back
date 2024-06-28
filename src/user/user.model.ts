import { prop } from '@typegoose/typegoose';
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { Types } from 'mongoose';

export interface IUserModel extends Base {}

export class UserModel extends TimeStamps {
  _id: Types.ObjectId;

  @prop({ unique: true })
  email: string;

  @prop()
  firstName: string;

  @prop()
  lastName: string;

  @prop()
  middleName: string;

  @prop()
  country: string;

  @prop()
  birthday: string;

  @prop()
  password: string;

  @prop({ default: 'student' })
  role?: string;
}
