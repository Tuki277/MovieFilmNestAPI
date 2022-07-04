import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  fullname: string;

  @Prop({ required: true })
  age: number;

  @Prop({ required: true })
  address: string;

  @Prop({ default: 3 }) //1: super admin, 2: admin, 3: user
  role: number;

  @Prop()
  refreshToken: string;

  @Prop({ default: 0 })
  movieView: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
