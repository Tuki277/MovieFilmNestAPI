import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  CategoryMovie,
  CategoryMovieDocument,
} from './schema/categorymovie.schema';
import {
  DocumentDefinition,
  FilterQuery,
  Model,
  QueryOptions,
  UpdateQuery,
} from 'mongoose';
import { MovieService } from '../movie/movie.service';

@Injectable()
export class CategoryMovieRepository {
  constructor(
    @InjectModel(CategoryMovie.name)
    private categoryModel: Model<CategoryMovieDocument>,
    private movieService: MovieService,
  ) {}

  async createCategory(
    input: DocumentDefinition<CategoryMovieDocument>,
  ): Promise<CategoryMovie> {
    try {
      return await this.categoryModel.create(input);
    } catch (e) {
      throw new Error(e);
    }
  }

  async getAllCategory(): Promise<CategoryMovie[]> {
    return this.categoryModel.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userCreated',
          foreignField: '_id',
          as: 'authors',
        },
      },
      {
        $project: {
          'authors.fullname': 1,
          title: 1,
        },
      },
    ]);
  }

  async filterCategory(
    query: FilterQuery<CategoryMovieDocument>,
    options: QueryOptions = { learn: true },
  ): Promise<CategoryMovie> {
    return this.categoryModel.findOne(query, {}, options);
  }

  async updateCategory(
    query: FilterQuery<CategoryMovieDocument>,
    update: UpdateQuery<CategoryMovieDocument>,
    options: QueryOptions,
  ): Promise<CategoryMovie> {
    return this.categoryModel.findOneAndUpdate(query, update, options);
  }

  // async deleteCategory(id: string) {
  //   const dataResult = await this.categoryModel.findById(id);
  //   dataResult.movie.forEach((x) => {
  //     this.movieService.deleteMovie(x.toString());
  //   });
  //   return this.categoryModel.findByIdAndDelete(id);
  // }

  async findById(id: string) {
    return this.categoryModel.findById(id);
  }
}
