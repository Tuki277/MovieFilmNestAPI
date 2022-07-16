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
    } catch (error) {
      throw new Error(error);
    }
  }

  async getAllCategory(): Promise<CategoryMovie[]> {
    try {
      return await this.categoryModel.aggregate([
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
            movie: 1,
          },
        },
      ]);
    } catch (error) {
      throw new Error(error);
    }
  }

  async filterCategory(
    query: FilterQuery<CategoryMovieDocument>,
    options: QueryOptions = { learn: true },
  ): Promise<CategoryMovie> {
    try {
      return await this.categoryModel.findOne(query, {}, options);
    } catch (error) {
      throw new Error(error);
    }
  }

  async updateCategory(
    query: FilterQuery<CategoryMovieDocument>,
    update: UpdateQuery<CategoryMovieDocument>,
    options: QueryOptions,
  ): Promise<CategoryMovie> {
    try {
      return await this.categoryModel.findOneAndUpdate(query, update, options);
    } catch (error) {
      throw new Error(error);
    }
  }

  async deleteCategory(id: string) {
    const dataResult = await this.categoryModel.findById(id);
    dataResult.movie.forEach((x) => {
      this.movieService.deleteMovie(x.toString());
    });
    return this.categoryModel.findByIdAndDelete(id);
  }

  async findById(id: string) {
    try {
      return this.categoryModel.findById(id);
    } catch (error) {
      throw new Error(error);
    }
  }
}
