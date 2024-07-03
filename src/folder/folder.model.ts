import { prop } from '@typegoose/typegoose';
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { Types } from 'mongoose';

export interface IFolderModel extends Base {}

export class FolderModel extends TimeStamps {
  _id: Types.ObjectId;

  @prop()
  ownerID: Types.ObjectId;

  @prop()
  folderName: string;

  @prop({ default: 'folder' })
  type: string;

  @prop({ type: [Types.ObjectId], default: [] })
  children: Types.ObjectId[];

  @prop({ type: Types.ObjectId, default: null })
  parentID: Types.ObjectId;
}
