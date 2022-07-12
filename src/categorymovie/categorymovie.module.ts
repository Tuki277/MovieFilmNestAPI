import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MovieService } from '../movie/movie.service';
import { Movie, MovieSchema } from 'src/movie/schema/movie.schema';
import { User, UserSchema } from 'src/user/schemas/user.schema';
import { CategorymovieController } from './categorymovie.controller';
import { CategorymovieService } from './categorymovie.service';
import {
  CategoriesMovieSchema,
  CategoryMovie,
} from './schema/categorymovie.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CategoryMovie.name, schema: CategoriesMovieSchema },
      { name: Movie.name, schema: MovieSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [CategorymovieController],
  providers: [CategorymovieService, MovieService],
})
export class CategorymovieModule {}
