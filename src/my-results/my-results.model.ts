import { prop } from '@typegoose/typegoose';
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { Date, Types } from 'mongoose';

export interface IUserModel extends Base {}

class ActiveSharedUrl {
  sharedAt: Date;
  sharedCloseAt: Date;
}

export class MyResultsModel extends TimeStamps {
  _id: Types.ObjectId;

  @prop()
  ownerID: Types.ObjectId;

  @prop({ type: Types.ObjectId, default: null })
  parentID: Types.ObjectId;

  @prop({ ref: 'Lesson' })
  lessonID: Types.ObjectId;

  @prop()
  lessonName: string;

  @prop({ default: 0 })
  visitCount: number;

  @prop({ default: null })
  activeSharedUrl: ActiveSharedUrl;
}
