import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategorymovieService } from 'src/categorymovie/categorymovie.service';
import {
  CategoriesMovieSchema,
  CategoryMovie,
} from 'src/categorymovie/schema/categorymovie.schema';
import { MovieController } from './movie.controller';
import { MovieService } from './movie.service';
import { Movie, MovieSchema } from './schema/movie.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Movie.name, schema: MovieSchema },
      { name: CategoryMovie.name, schema: CategoriesMovieSchema },
    ]),
  ],
  controllers: [MovieController],
  providers: [MovieService, CategorymovieService],
  exports: [MovieService],
})
export class MovieModule {}
