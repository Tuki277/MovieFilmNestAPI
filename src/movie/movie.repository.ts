import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, {
  DocumentDefinition,
  FilterQuery,
  Model,
  QueryOptions,
  UpdateQuery,
} from 'mongoose';
import {
  CategoryMovie,
  CategoryMovieDocument,
} from '../categorymovie/schema/categorymovie.schema';
import { Movie, MovieDocument } from './schema/movie.schema';
import * as fs from 'fs';
import { User, UserDocument } from '../user/schemas/user.schema';
import { ErrorResponse } from 'src/commons/response/error';

@Injectable()
export class MovieRepository extends ErrorResponse {
  constructor(
    @InjectModel(Movie.name) private movieModel: Model<MovieDocument>,
    @InjectModel(CategoryMovie.name)
    private categoryModel: Model<CategoryMovieDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
    super();
  }

  async createMovie(input: DocumentDefinition<MovieDocument>): Promise<Movie> {
    try {
      return await this.movieModel.create(input);
    } catch (error) {
      this.errorRes(error);
    }
  }

  async deleteMovie(id: string) {
    try {
      const movie: MovieDocument = await this.movieModel.findById(id);
      const fileLocation = movie.filmLocation;
      fs.unlinkSync(fileLocation);
      await this.categoryModel.findByIdAndUpdate(
        { _id: movie.categoryMovie },
        { $pull: { movie: movie._id.toString() } },
      );
      await this.userModel.findByIdAndUpdate(
        { _id: movie.authorCreated },
        { $pull: { movie: movie._id.toString() } },
      );
      return this.movieModel.findByIdAndRemove(id);
    } catch (error) {
      this.errorRes(error);
    }
  }

  async filterMovie(
    query: FilterQuery<MovieDocument>,
    reqBody?: { page: number; rowPerPage: number },
  ) {
    try {
      if (query._id) {
        query = {
          _id: new mongoose.Types.ObjectId(query._id),
        };
      }
      return this.movieModel.aggregate([
        { $match: query },
        {
          $lookup: {
            from: 'categorymovies',
            localField: 'categoryMovie',
            foreignField: '_id',
            as: 'category',
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'authorCreated',
            foreignField: '_id',
            as: 'authors',
          },
        },
        {
          $project: {
            title: 1,
            description: 1,
            filmLocation: 1,
            region: 1,
            views: 1,
            yearRelease: 1,
            status: 1,
            fileName: 1,
            authorCreated: 1,
            'category.title': 1,
            'authors.fullname': 1,
          },
        },
        {
          $skip: reqBody
            ? reqBody.page * reqBody.rowPerPage - reqBody.rowPerPage
            : 0,
        },
        { $limit: reqBody ? reqBody.rowPerPage : 100 },
      ]);
    } catch (error) {
      this.errorRes(error);
    }
  }

  async getMovie(reqBody: { page: number; rowPerPage: number }) {
    try {
      return this.movieModel.aggregate([
        {
          $lookup: {
            from: 'categorymovies',
            localField: 'categoryMovie',
            foreignField: '_id',
            as: 'category',
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'authorCreated',
            foreignField: '_id',
            as: 'authors',
          },
        },
        {
          $project: {
            title: 1,
            description: 1,
            filmLocation: 1,
            region: 1,
            views: 1,
            yearRelease: 1,
            status: 1,
            fileName: 1,
            'category.title': 1,
            'authors.fullname': 1,
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
}
