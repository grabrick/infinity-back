// import { modelOptions, prop } from '@typegoose/typegoose';
// import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
// import { Types } from 'mongoose';

// export interface ILessonModel extends Base {}

// @modelOptions({ schemaOptions: { _id: false } })
// class QuestionFieldsModel {
//   @prop()
//   number: number;

//   @prop()
//   symbol: string;

//   @prop({ default: '' })
//   field: string;

//   @prop({ default: false })
//   isCorrect: boolean;
// }

// class QuestionModel {
//   _id: Types.ObjectId;

//   @prop({ default: '' })
//   questionName: string;

//   @prop({ type: () => [QuestionFieldsModel] })
//   questionFields: QuestionFieldsModel[];
// }

// export class LessonModel extends TimeStamps {
//   _id: Types.ObjectId;

//   @prop()
//   ownerID: Types.ObjectId;

//   @prop()
//   lessonName: string;

//   @prop({ default: 'lesson' })
//   type: string;

//   @prop({ type: Types.ObjectId, default: null })
//   parentID: Types.ObjectId;

//   @prop()
//   template: string;

//   @prop({ type: () => [QuestionModel] })
//   questions: QuestionModel[];

//   @prop({ type: () => Object, default: {} })
//   lessonSettings: object;
// }

import { modelOptions, prop } from '@typegoose/typegoose';
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { Types } from 'mongoose';

export interface ILessonModel extends Base {}

@modelOptions({ schemaOptions: { _id: false } })
class ShufflingOption {
  @prop()
  optionID: number;

  @prop()
  name: string;

  @prop()
  selected: boolean;
}

@modelOptions({ schemaOptions: { _id: false } })
class EndGameOption {
  @prop()
  optionID: number;

  @prop()
  name: string;

  @prop()
  selected: boolean;
}

@modelOptions({ schemaOptions: { _id: false } })
class SymbolOption {
  @prop()
  id: number;

  @prop()
  title: string;

  @prop()
  selected: boolean;
}

@modelOptions({ schemaOptions: { _id: false } })
class TimerOptionSelected {
  @prop()
  id: number;

  @prop()
  title: string;

  @prop()
  selected: boolean;
}

@modelOptions({ schemaOptions: { _id: false } })
class TimerOptionTime {
  @prop()
  minutes: number;

  @prop()
  seconds: number;
}

@modelOptions({ schemaOptions: { _id: false } })
class TimerOption {
  @prop({ type: () => [TimerOptionSelected] })
  selected: TimerOptionSelected[];

  @prop({ type: () => TimerOptionTime })
  time: TimerOptionTime;
}

@modelOptions({ schemaOptions: { _id: false } })
class limitOnLivesOption {
  @prop()
  lives: number;
}
@modelOptions({ schemaOptions: { _id: false } })
class labelingOption {
  @prop()
  name: string;

  @prop()
  optionID: number;

  @prop()
  selected: boolean;
}

@modelOptions({ schemaOptions: { _id: false } })
class ClearTimeOption {
  @prop()
  id: number;

  @prop()
  title: string;

  @prop()
  selected: boolean;
}

@modelOptions({ schemaOptions: { _id: false } })
class DuplicateNameOption {
  @prop()
  id: number;

  @prop()
  title: string;

  @prop()
  selected: boolean;
}

@modelOptions({ schemaOptions: { _id: false } })
class LeadersSize {
  @prop()
  leaders: number;
}

@modelOptions({ schemaOptions: { _id: false } })
class LeaderboardOption {
  @prop({ type: () => [ClearTimeOption] })
  clearTime: ClearTimeOption[];

  @prop({ type: () => [DuplicateNameOption] })
  duplicateName: DuplicateNameOption[];

  @prop({ type: () => LeadersSize })
  leadersSize: LeadersSize;
}

// @modelOptions({ schemaOptions: { _id: false } })
// class File {
//   fileName: string;
//   size: number;
//   originalName: string;
//   mimeType: string;
// }

// @modelOptions({ schemaOptions: { _id: false } })
// class MusicOption {
//   @prop({ type: () => File })
//   file: File;

//   fileUrl: string;
// }

@modelOptions({ schemaOptions: { _id: false } })
class AudioFile {
  file: any;

  fileUrl: string;
}

@modelOptions({ schemaOptions: { _id: false } })
class SoundsOption {
  id: number;

  name: string;

  audioFile: AudioFile;
}

@modelOptions({ schemaOptions: { _id: false } })
class Soundboard {
  // @prop({ type: () => MusicOption, default: null })
  // music: MusicOption;

  @prop({ default: null })
  music: any;

  @prop({ type: () => [SoundsOption], default: null })
  sounds: SoundsOption[];
}

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

@modelOptions({ schemaOptions: { _id: false } })
class LessonSettings {
  @prop({ type: () => TimerOption, default: null })
  timer: TimerOption;

  @prop({ type: () => limitOnLivesOption, default: null })
  limitOnLives: limitOnLivesOption;

  @prop({ type: () => [ShufflingOption], default: [] })
  shuffling: ShufflingOption[];

  @prop({ type: () => labelingOption, default: null })
  labeling: labelingOption;

  @prop({
    type: () => EndGameOption,
    default: () => ({
      optionID: 1,
      name: 'Показать ответы после игры',
      selected: false,
    }),
  })
  endGame: EndGameOption;

  @prop({ type: () => [SymbolOption], default: [] })
  symbol: SymbolOption[];

  @prop({ type: () => LeaderboardOption, default: null })
  leaderboard: LeaderboardOption;

  @prop({ type: () => Soundboard, default: { music: null, sounds: null } })
  soundboard: Soundboard;
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

  @prop({
    type: () => LessonSettings,
    default: () => ({
      timer: null,
      limitOnLives: null,
      shuffling: [
        { optionID: 1, name: 'Порядок вопросов', selected: true },
        { optionID: 2, name: 'Порядок ответов', selected: false },
      ],
      labeling: null,
      endGame: {
        optionID: 1,
        name: 'Показать ответы после игры',
        selected: false,
      },
      symbol: [
        { id: 1, title: 'A, B, C', selected: true },
        { id: 2, title: 'Никакой', selected: false },
      ],
      leaderboard: null,
      soundboard: { music: null, sounds: null },
    }),
  })
  lessonSettings: LessonSettings;
}
