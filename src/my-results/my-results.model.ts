import { modelOptions, prop } from '@typegoose/typegoose';
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { Date, Types } from 'mongoose';

export interface IUserModel extends Base {}

class ActiveSharedUrl {
  sharedAt: Date;
  sharedCloseAt: Date;
}

@modelOptions({ schemaOptions: { _id: false } })
class Users {
  userName: string;

  @prop({ type: Types.ObjectId || null })
  userID: Types.ObjectId | null;

  correct: number;

  incorrect: number;

  currentTime: string;

  selectedAnswers: any[];

  @prop({ type: () => Date, default: new Date() })
  createdAt: Date;
}

@modelOptions({ schemaOptions: { _id: false } })
class QuestionFieldsModel {
  @prop()
  number: number;

  @prop()
  symbol: string;

  @prop({ default: '' })
  answer: string;

  @prop({ default: false })
  isCorrect: boolean;
}

@modelOptions({ schemaOptions: { _id: false } })
class QuestionModel {
  id: number;

  name: string;

  fields: QuestionFieldsModel[];

  correct: number;

  incorrect: number;
}

export class MyResultsModel extends TimeStamps {
  _id: Types.ObjectId;

  @prop()
  ownerID: Types.ObjectId;

  @prop({ type: Types.ObjectId, default: null })
  parentID: Types.ObjectId;

  @prop({ ref: 'Lesson' })
  lessonID: Types.ObjectId;

  @prop({ default: 'sharedResult' })
  type: string;

  @prop()
  lessonName: string;

  @prop({ default: 0 })
  visitCount: number;

  @prop({ default: [] })
  users: Users[];

  @prop({ default: [] })
  questions: QuestionModel[];

  @prop({ type: () => Object, default: {} })
  lessonSettings: any;

  @prop({ default: null })
  activeSharedUrl: ActiveSharedUrl;
}
