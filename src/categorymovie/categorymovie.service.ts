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
export class CategoryMovieService {
  constructor(private categoryMovieRepository: CategoryMovieRepository) {}

  createCategory(
    input: DocumentDefinition<CategoryMovieDocument>,
  ): Promise<CategoryMovie> {
    return this.categoryMovieRepository.createCategory(input);
  }

  getCountCategory() {
    return this.categoryMovieRepository.getCountCategory();
  }

  getAllCategory(reqBody): Promise<CategoryMovie[]> {
    return this.categoryMovieRepository.getAllCategory(reqBody);
  }

  filterCategory(
    query: FilterQuery<CategoryMovieDocument>,
    options: QueryOptions = { learn: true },
  ): Promise<CategoryMovie> {
    return this.categoryMovieRepository.filterCategory(query, options);
  }

  updateCategory(
    query: FilterQuery<CategoryMovieDocument>,
    update: UpdateQuery<CategoryMovieDocument>,
    options: QueryOptions,
  ): Promise<CategoryMovie> {
    return this.categoryMovieRepository.updateCategory(query, update, options);
  }

  deleteCategory(id: string) {
    return this.categoryMovieRepository.deleteCategory(id);
  }
}
