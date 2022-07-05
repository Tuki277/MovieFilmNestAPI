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
} from 'src/categorymovie/schema/categorymovie.schema';
import { Movie, MovieDocument } from './schema/movie.schema';
import * as fs from 'fs';

@Injectable()
export class MovieService {
  constructor(
    @InjectModel(Movie.name) private movieModel: Model<MovieDocument>,
    @InjectModel(CategoryMovie.name)
    private categoryModel: Model<CategoryMovieDocument>,
  ) {}

  async createMovie(input: DocumentDefinition<MovieDocument>): Promise<Movie> {
    return this.movieModel.create(input);
  }

  async deleteMovie(id: string) {
    const movie: MovieDocument = await this.movieModel.findById(id);
    const fileLocation = movie.filmLocation;
    fs.unlinkSync(fileLocation);
    await this.categoryModel.findByIdAndUpdate(
      { _id: movie.categoryMovie },
      { $pull: { movie: movie._id.toString() } },
    );
    return this.movieModel.findByIdAndRemove(id);
  }

  async filterMovie(id: string) {
    return this.movieModel.findById(id);
  }

  async getMovie() {
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
          'category.title': 1,
          'authors.fullname': 1,
        },
      },
    ]);
  }

  // async updateNews(
  //   query: FilterQuery<MovieDocument>,
  //   update: UpdateQuery<MovieDocument>,
  //   options: QueryOptions,
  // ) {
  //   //lay ra news -> category news de so sanh
  //   const movie: MovieDocument = await this.newsModel.findOne(query);

  //   // neu category khong thay doi
  //   if (movie.categoryMovie === update.categoryMovie) {
  //     return this.newsModel.findOneAndUpdate(query, update, options);
  //   } else {
  //     //neu category thay doi
  //     //them news vao news[] trong category
  //     await this.categoryModel.findByIdAndUpdate(
  //       { _id: update.categories },
  //       { $push: { news: movie._id.toString() } },
  //     );
  //     // xoa news trong news[] o du lieu cu
  //     await this.categoryModel.findByIdAndUpdate(
  //       { _id: movie.categoryMovie },
  //       { $pull: { news: movie._id.toString() } },
  //     );
  //     return this.newsModel.findOneAndUpdate(query, update, options);
  //   }
  // }

  // async convertStringToObjectId(id: string) {
  //   return new mongoose.Types.ObjectId(id);
  // }

  // async filterNews(query: FilterQuery<MovieDocument>) {
  //   if (query._id) {
  //     query = {
  //       _id: new mongoose.Types.ObjectId(query._id),
  //     };
  //   }
  //   return this.newsModel.aggregate([
  //     { $match: query },
  //     {
  //       $lookup: {
  //         from: 'categories',
  //         localField: 'categories',
  //         foreignField: '_id',
  //         as: 'category',
  //       },
  //     },
  //     {
  //       $lookup: {
  //         from: 'users',
  //         localField: 'author',
  //         foreignField: '_id',
  //         as: 'authors',
  //       },
  //     },
  //     {
  //       $project: {
  //         categories: 0,
  //         author: 0,
  //         'authors.username': 0,
  //         'authors.password': 0,
  //         'authors.refreshToken': 0,
  //         'category.userCreated': 0,
  //       },
  //     },
  //   ]);
  // }
}
