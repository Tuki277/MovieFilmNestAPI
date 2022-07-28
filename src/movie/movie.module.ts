import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoryMovieRepository } from 'src/categorymovie/categorymovie.repository';
import { UserRepository } from 'src/user/user.repository';
import { CategoryMovieService } from '../categorymovie/categorymovie.service';
import {
  CategoriesMovieSchema,
  CategoryMovie,
} from '../categorymovie/schema/categorymovie.schema';
import { User, UserSchema } from '../user/schemas/user.schema';
import { UserService } from '../user/user.service';
import { MovieController } from './movie.controller';
import { MovieRepository } from './movie.repository';
import { MovieService } from './movie.service';
import { Movie, MovieSchema } from './schema/movie.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Movie.name, schema: MovieSchema },
      { name: User.name, schema: UserSchema },
      { name: CategoryMovie.name, schema: CategoriesMovieSchema },
    ]),
  ],
  controllers: [MovieController],
  providers: [
    CategoryMovieRepository,
    CategoryMovieService,
    MovieRepository,
    MovieService,
    UserService,
    UserRepository,
  ],
  exports: [MovieService],
})
export class MovieModule {}
