import { Injectable } from '@nestjs/common';
import { FilterQuery } from 'mongoose';
import { Movie, MovieDocument } from './schema/movie.schema';
import { MovieRepository } from './movie.repository';
import * as fs from 'fs';
import { User, UserDocument } from 'src/user/schemas/user.schema';
import { confirmUserCreated, getDateTimeNow } from 'src/helpers';
import { UserRepository } from 'src/user/user.repository';
import { Stripe } from 'stripe';
import { CategoryMovie } from 'src/categorymovie/schema/categorymovie.schema';
import { ErrorResponse } from 'src/commons/response/error';
import { log } from 'src/commons/logger';
import { ResponseMessage } from 'src/commons/consts/response.const';
import { LevelLogger } from 'src/commons/consts/loger.const';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2020-08-27',
});

@Injectable()
export class MovieService extends ErrorResponse {
  constructor(
    private movieRepository: MovieRepository,
    private userRepository: UserRepository,
  ) {
    super();
  }

  async createMovie(
    dataJson,
    userId,
    renameFileUpload,
    reqFile,
    categoryId,
  ): Promise<Movie> {
    try {
      if (reqFile != undefined) {
        const category: CategoryMovie =
          await this.movieRepository.filterCategory({
            _id: categoryId,
          });
        if (category) {
          const movieCreated = await this.movieRepository.createMovie({
            ...dataJson,
            authorCreated: userId.toString(),
            filmLocation: renameFileUpload,
            fileName: getDateTimeNow() + reqFile.file,
          });
          const user: User = await this.userRepository.filterUser({
            _id: userId,
          });
          user.movie.push(movieCreated);
          await this.userRepository.updateUser({ _id: userId }, user, {
            new: true,
          });
          category.movie.push(movieCreated);
          await this.movieRepository.updateCategory(
            { _id: categoryId },
            category,
            {
              new: true,
            },
          );
          return movieCreated;
        }
        this.errorRes('not found category');
      }
      this.errorRes('File upload not empty');
    } catch (error) {
      this.errorRes(error);
    }
  }

  async deleteMovie(id: string) {
    try {
      return this.movieRepository.deleteMovie(id);
    } catch (error) {
      this.errorRes(error);
    }
  }

  async deleteMovieService(id: string, user: UserDocument) {
    try {
      const movieFilter: MovieDocument[] =
        await this.movieRepository.filterMovie({
          _id: id,
        });
      if (movieFilter.length > 0) {
        if (user.role === 3) {
          if (
            confirmUserCreated(
              user._id.toString(),
              movieFilter[0].authorCreated.toString(),
            )
          ) {
            return this.movieRepository.deleteMovie(id);
          }
          throw new Error('forbidden');
        }
        return await this.movieRepository.deleteMovie(id);
      }
      throw new Error('not found');
    } catch (error) {
      this.errorRes(error);
    }
  }

  async filterMovie(query: FilterQuery<MovieDocument>) {
    return this.movieRepository.filterMovie(query);
  }

  async getMovie(reqQuery) {
    return this.movieRepository.getMovie(reqQuery);
  }

  searchMovie(body) {
    try {
      const { text } = body;
      return this.movieRepository.filterMovie(
        {
          title: { $regex: new RegExp(text, 'i') },
        },
        body,
      );
    } catch (error) {
      this.errorRes(error);
    }
  }

  async playVideoStream(id, range) {
    try {
      const dataResult: MovieDocument[] =
        await this.movieRepository.filterMovie({
          _id: id,
        });

      const videoPath = dataResult[0].filmLocation;
      const videoSize = fs.statSync(videoPath).size;

      const chunkSize = 1 * 1e6;
      const start = Number(range.replace(/\D/g, ''));
      const end = Math.min(start + chunkSize, videoSize - 1);

      const contentLength = end - start + 1;

      const headers = {
        'Content-Range': `bytes ${start}-${end}/${videoSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': contentLength,
        'Content-Type': 'video/mp4',
      };

      return {
        headers,
        videoPath,
        start,
        end,
      };
    } catch (error) {
      this.errorRes(error);
    }
  }

  async getDetailMovie(id, idUser) {
    try {
      const movie = await this.movieRepository.filterMovie({
        _id: id,
      });
      if (movie.length > 0) {
        const userFind: UserDocument = await this.userRepository.filterUser({
          _id: idUser,
        });
        const found = userFind.movieBuy.find((x) => x.toString() == id);
        if (found !== undefined) {
          return {
            ...movie,
            watch: true,
          };
        }
        return {
          ...movie,
          watch: false,
        };
      }
      this.errorRes('not found');
    } catch (error) {
      this.errorRes(error);
    }
  }

  async buyMovie(req, userId) {
    try {
      const { email, amount, currency, movieId } = req.body;
      const customer = await stripe.customers.list({
        email,
      });
      if (customer.data.length > 0) {
        const cusId = customer.data[0].id;
        const charge = await stripe.charges.create({
          customer: cusId,
          currency,
          amount,
        });
        if (charge.status === 'succeeded') {
          const user: User = await this.userRepository.filterUser({
            _id: userId,
          });
          const findIdMovie: MovieDocument[] =
            await this.movieRepository.filterMovie({
              _id: movieId,
            });
          if (findIdMovie.length > 0) {
            user.movieBuy.push(findIdMovie[0]._id);
            return await this.userRepository.updateUser({ _id: userId }, user, {
              new: true,
            });
          }
          log(req, ResponseMessage.NOT_FOUND, LevelLogger.INFO);
          this.errorRes('not found');
        }
        log(req, ResponseMessage.BUY_FAIL, LevelLogger.WARNING);
        this.errorRes('pay fail');
      }
    } catch (error) {
      log(req, error.message, LevelLogger.ERROR);
      this.errorRes(error);
    }
  }
}
