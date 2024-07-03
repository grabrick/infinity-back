import { Ref, prop } from '@typegoose/typegoose';
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { Types } from 'mongoose';

export interface ILessonModel extends Base {}

class QuestionFieldsModel {
  _id: false;

  @prop()
  field: string;

  @prop()
  isCorrect: boolean;
}

class QuestionModel {
  _id: false;

  @prop()
  questionName: string;

  @prop({ default: [], ref: () => QuestionFieldsModel })
  questionFields: Ref<QuestionFieldsModel>[];
}

export class LessonModel extends TimeStamps {
  _id: Types.ObjectId;

  @prop()
  ownerID: Types.ObjectId;

  @prop()
  lessonName: string;

  @prop({ default: 'lesson' })
  type: string;

  @prop()
  template: string;

  @prop({ default: [], ref: () => QuestionModel })
  question: Ref<QuestionModel>[];
}
