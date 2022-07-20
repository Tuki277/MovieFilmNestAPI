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
import { ErrorResponse } from 'src/commons/response/error';

@Injectable()
export class CategorymovieService extends ErrorResponse {
  constructor(private categoryMovieRepository: CategoryMovieRepository) {
    super();
  }

  async createCategory(
    input: DocumentDefinition<CategoryMovieDocument>,
  ): Promise<CategoryMovie> {
    try {
      return await this.categoryMovieRepository.createCategory(input);
    } catch (error) {
      this.errorRes(error);
    }
  }

  async getAllCategory(reqBody): Promise<CategoryMovie[]> {
    try {
      return await this.categoryMovieRepository.getAllCategory(reqBody);
    } catch (error) {
      this.errorRes(error);
    }
  }

  async filterCategory(
    query: FilterQuery<CategoryMovieDocument>,
    options: QueryOptions = { learn: true },
  ): Promise<CategoryMovie> {
    try {
      return await this.categoryMovieRepository.filterCategory(query, options);
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
      return await this.categoryMovieRepository.updateCategory(
        query,
        update,
        options,
      );
    } catch (error) {
      this.errorRes(error);
    }
  }

  async deleteCategory(id: string) {
    try {
      return await this.categoryMovieRepository.deleteCategory(id);
    } catch (error) {
      this.errorRes(error);
    }
  }
}
