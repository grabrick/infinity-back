import { modelOptions, prop } from '@typegoose/typegoose';
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { Types } from 'mongoose';

export interface ILessonModel extends Base {}

@modelOptions({ schemaOptions: { _id: false } })
class QuestionFieldsModel {
  @prop()
  number: number;

  @prop()
  symbol: string;

  @prop({ default: '' })
  field: string;

  @prop({ default: false })
  isCorrect: boolean;
}

class QuestionModel {
  _id: Types.ObjectId;

  @prop({ default: '' })
  questionName: string;

  @prop({ type: () => [QuestionFieldsModel] })
  questionFields: QuestionFieldsModel[];
}

export class LessonModel extends TimeStamps {
  _id: Types.ObjectId;

  @prop()
  ownerID: Types.ObjectId;

  @prop()
  lessonName: string;

  @prop({ default: 'lesson' })
  type: string;

  @prop({ type: Types.ObjectId, default: null })
  parentID: Types.ObjectId;

  @prop()
  template: string;

  @prop({ type: () => [QuestionModel] })
  questions: QuestionModel[];
}
