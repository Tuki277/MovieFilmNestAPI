import { Injectable } from '@nestjs/common';
import {
  CategoryMovie,
  CategoryMovieDocument,
} from './schema/categorymovie.schema';
import {
  DocumentDefinition,
  FilterQuery,
  QueryOptions,
  UpdateQuery,
} from 'mongoose';
import { CategoryMovieRepository } from './categorymovie.repository';

@Injectable()
export class CategorymovieService {
  constructor(private categoryMovieRepository: CategoryMovieRepository) {}

  createCategory(
    input: DocumentDefinition<CategoryMovieDocument>,
  ): Promise<CategoryMovie> {
    return this.categoryMovieRepository.createCategory(input);
  }

  async getAllCategory(): Promise<CategoryMovie[]> {
    return this.categoryMovieRepository.getAllCategory();
  }

  async filterCategory(
    query: FilterQuery<CategoryMovieDocument>,
    options: QueryOptions = { learn: true },
  ): Promise<CategoryMovie> {
    return this.categoryMovieRepository.filterCategory(query, options);
  }

  async updateCategory(
    query: FilterQuery<CategoryMovieDocument>,
    update: UpdateQuery<CategoryMovieDocument>,
    options: QueryOptions,
  ): Promise<CategoryMovie> {
    return this.categoryMovieRepository.updateCategory(query, update, options);
  }

  // async deleteCategory(id: string) {
  //   const dataResult = await this.categoryMovieRepository.findById(id);
  //   dataResult.movie.forEach((x) => {
  //     this.movieService.deleteMovie(x.toString());
  //   });
  //   return this.categoryModel.findByIdAndDelete(id);
  // }
}
