import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategorymovieService } from '../categorymovie/categorymovie.service';
import {
  CategoriesMovieSchema,
  CategoryMovie,
} from '../categorymovie/schema/categorymovie.schema';
import { User, UserSchema } from '../user/schemas/user.schema';
import { UserService } from '../user/user.service';
import { MovieController } from './movie.controller';
import { MovieService } from './movie.service';
import { Movie, MovieSchema } from './schema/movie.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Movie.name, schema: MovieSchema },
      { name: CategoryMovie.name, schema: CategoriesMovieSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [MovieController],
  providers: [MovieService, CategorymovieService, UserService],
  exports: [MovieService],
})
export class MovieModule {}
