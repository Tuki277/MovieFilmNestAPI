import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { DocumentDefinition, FilterQuery, Model } from 'mongoose';
import {
  CategoryMovie,
  CategoryMovieDocument,
} from '../categorymovie/schema/categorymovie.schema';
import { Movie, MovieDocument } from './schema/movie.schema';
import * as fs from 'fs';
import { User, UserDocument } from '../user/schemas/user.schema';

@Injectable()
export class MovieRepository {
  constructor(
    @InjectModel(Movie.name) private movieModel: Model<MovieDocument>,
    @InjectModel(CategoryMovie.name)
    private categoryModel: Model<CategoryMovieDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
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
    await this.userModel.findByIdAndUpdate(
      { _id: movie.authorCreated },
      { $pull: { movie: movie._id.toString() } },
    );
    return this.movieModel.findByIdAndRemove(id);
  }

  async filterMovie(query: FilterQuery<MovieDocument>) {
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
    ]);
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
          fileName: 1,
          'category.title': 1,
          'authors.fullname': 1,
        },
      },
    ]);
  }
}
