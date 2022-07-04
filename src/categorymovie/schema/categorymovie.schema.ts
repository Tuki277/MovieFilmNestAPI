import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Movie } from 'src/movie/schema/movie.schema';
import { User } from '../../user/schemas/user.schema';

export type CategoryMovieDocument = CategoryMovie & Document;

@Schema({ timestamps: true })
export class CategoryMovie {
  @Prop({ required: true })
  title: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'users' })
  userCreated: User;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'movie' }])
  movie: Movie[];
}

export const CategoriesMovieSchema =
  SchemaFactory.createForClass(CategoryMovie);
