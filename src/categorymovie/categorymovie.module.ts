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
import { CategoryMovieRepository } from './categorymovie.repository';
import { MovieRepository } from 'src/movie/movie.repository';
import { UserService } from 'src/user/user.service';
import { UserRepository } from 'src/user/user.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CategoryMovie.name, schema: CategoriesMovieSchema },
      { name: Movie.name, schema: MovieSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [CategorymovieController],
  providers: [
    CategoryMovieRepository,
    CategorymovieService,
    MovieRepository,
    MovieService,
    UserService,
    UserRepository,
  ],
  exports: [CategorymovieService],
})
export class CategorymovieModule {}
