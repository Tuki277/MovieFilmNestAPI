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

  async createCategory(
    input: DocumentDefinition<CategoryMovieDocument>,
  ): Promise<CategoryMovie> {
    try {
      return await this.categoryMovieRepository.createCategory(input);
    } catch (error) {
      throw new Error(error);
    }
  }

  async getAllCategory(): Promise<CategoryMovie[]> {
    try {
      return await this.categoryMovieRepository.getAllCategory();
    } catch (error) {
      throw new Error(error);
    }
  }

  async filterCategory(
    query: FilterQuery<CategoryMovieDocument>,
    options: QueryOptions = { learn: true },
  ): Promise<CategoryMovie> {
    try {
      return await this.categoryMovieRepository.filterCategory(query, options);
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
      return await this.categoryMovieRepository.updateCategory(
        query,
        update,
        options,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  async deleteCategory(id: string) {
    try {
      return await this.categoryMovieRepository.deleteCategory(id);
    } catch (error) {
      throw new Error(error);
    }
  }
}
