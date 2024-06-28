import { prop } from '@typegoose/typegoose';
import mongoose from 'mongoose';

export class TokenModel {
  @prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: mongoose.Types.ObjectId;

  @prop({ required: true })
  accessToken: string;
}
