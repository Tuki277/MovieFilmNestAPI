import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MovieService } from 'src/movie/movie.service';
import { Movie, MovieSchema } from 'src/movie/schema/movie.schema';
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
    ]),
  ],
  controllers: [CategorymovieController],
  providers: [CategorymovieService, MovieService],
})
export class CategorymovieModule {}
