import { Injectable } from '@nestjs/common';
import { DocumentDefinition, FilterQuery } from 'mongoose';
import { Movie, MovieDocument } from './schema/movie.schema';
import { MovieRepository } from './movie.repository';
import { UserDocument } from 'src/user/schemas/user.schema';

@Injectable()
export class MovieService {
  constructor(private movieRepository: MovieRepository) {}

  async createMovie(input: DocumentDefinition<MovieDocument>): Promise<Movie> {
    return this.movieRepository.createMovie(input);
  }

  async deleteMovie(id: string) {
    return this.movieRepository.deleteMovie(id);
  }

  async filterMovie(query: FilterQuery<MovieDocument>) {
    return this.movieRepository.filterMovie(query);
  }

  async getMovie() {
    return this.movieRepository.getMovie();
  }

  async searchMovie(body) {
    console.log(body.text);
    const { text } = body;
    return this.movieRepository.filterMovie({
      title: { $regex: new RegExp(text, 'i') },
    });
  }
}
