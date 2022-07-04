import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { News } from '../../news/schema/news.schema';
import { User } from '../../user/schemas/user.schema';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true })
  title: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'users' })
  userCreated: User;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'news' }])
  news: News[];
}

export const CategoriesSchema = SchemaFactory.createForClass(Category);
