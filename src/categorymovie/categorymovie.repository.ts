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
import { BaseResponse } from 'src/commons/base/base.response';

@Injectable()
export class CategoryMovieRepository extends BaseResponse {
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
    return await this.categoryModel.create(input);
  }

  async getCountCategory() {
    return await this.categoryModel.find().count();
  }

  async getAllCategory(reqQuery): Promise<CategoryMovie[]> {
    const page = parseInt(reqQuery.page);
    const rowPerPage = parseInt(reqQuery.rowPerPage);
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
        $skip: page ? page * rowPerPage - rowPerPage : 0,
      },
      { $limit: rowPerPage ? rowPerPage : 100 },
    ]);
  }

  async filterCategory(
    query: FilterQuery<CategoryMovieDocument>,
    options: QueryOptions = { learn: true },
  ): Promise<CategoryMovie> {
    return await this.categoryModel.findOne(query, {}, options);
  }

  async updateCategory(
    query: FilterQuery<CategoryMovieDocument>,
    update: UpdateQuery<CategoryMovieDocument>,
    options: QueryOptions,
  ): Promise<CategoryMovie> {
    return await this.categoryModel.findOneAndUpdate(query, update, options);
  }

  async deleteCategory(id: string) {
    const dataResult = await this.categoryModel.findById(id);
    dataResult.movie.forEach((x) => {
      this.movieService.deleteMovie(x.toString());
    });
    return this.categoryModel.findByIdAndDelete(id);
  }

  async findById(id: string) {
    return this.categoryModel.findById(id);
  }
}
