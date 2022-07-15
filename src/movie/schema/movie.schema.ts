import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from '../../user/schemas/user.schema';
import { CategoryMovie } from '../../categorymovie/schema/categorymovie.schema';

export type MovieDocument = Movie & Document;

@Schema({ timestamps: true })
export class Movie {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'users' })
  authorCreated: User;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'categoryMovie',
  })
  categoryMovie: CategoryMovie;

  @Prop({ default: 0 })
  views: number;

  @Prop({ default: Date.now() })
  yearRelease: Date;

  @Prop({ default: 'unknown' })
  region: string;

  @Prop()
  filmLocation: string;

  @Prop({ default: 0 }) // 0: pending, 1: updating, 3 done
  status: number;

  @Prop({ required: true })
  fileName: string;

  @Prop({ default: 0 })
  price: number;
}

export const MovieSchema = SchemaFactory.createForClass(Movie);
