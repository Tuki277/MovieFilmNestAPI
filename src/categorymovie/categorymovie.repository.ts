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
import { ErrorResponse } from 'src/commons/response/error';

@Injectable()
export class CategoryMovieRepository extends ErrorResponse {
  constructor(
    @InjectModel(CategoryMovie.name)
    private categoryModel: Model<CategoryMovieDocument>,
    private movieService: MovieService,
  ) {
    super();
  }

  async createCategory(
    input: DocumentDefinition<CategoryMovieDocument>,
  ): Promise<CategoryMovie> {
    try {
      return await this.categoryModel.create(input);
    } catch (error) {
      this.errorRes(error);
    }
  }

  async getAllCategory(reqBody: {
    page: number;
    rowPerPage: number;
  }): Promise<CategoryMovie[]> {
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
        {
          $skip: reqBody.page
            ? reqBody.page * reqBody.rowPerPage - reqBody.rowPerPage
            : 0,
        },
        { $limit: reqBody.rowPerPage ? reqBody.rowPerPage : 100 },
      ]);
    } catch (error) {
      this.errorRes(error);
    }
  }

  async filterCategory(
    query: FilterQuery<CategoryMovieDocument>,
    options: QueryOptions = { learn: true },
  ): Promise<CategoryMovie> {
    try {
      return await this.categoryModel.findOne(query, {}, options);
    } catch (error) {
      this.errorRes(error);
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
      this.errorRes(error);
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
      this.errorRes(error);
    }
  }
}
