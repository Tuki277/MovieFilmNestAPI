import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Movie } from '../../movie/schema/movie.schema';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  username: string;

  @Prop()
  password: string;

  @Prop({ required: true })
  fullname: string;

  @Prop({ required: true })
  age: number;

  @Prop({ required: true })
  address: string;

  @Prop({ default: 3 }) //1: super admin, 2: admin, 3: user
  role: number;

  @Prop({ default: 'local', enum: ['local', 'google'] })
  authType: string;

  @Prop()
  refreshToken: string;

  @Prop({ default: 0 })
  movieView: number;

  @Prop({ default: 0 })
  movieUpload: number;

  @Prop([
    { type: mongoose.Schema.Types.ObjectId, ref: 'movie' },
    { default: [] },
  ])
  movieBuy: Movie[];
}

export const UserSchema = SchemaFactory.createForClass(User);
