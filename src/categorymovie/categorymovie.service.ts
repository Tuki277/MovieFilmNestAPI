import { HttpStatus, Injectable } from '@nestjs/common';
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
import { BaseResponse } from 'src/commons/base/base.response';

@Injectable()
export class CategoryMovieService extends BaseResponse {
  constructor(private categoryMovieRepository: CategoryMovieRepository) {
    super();
  }

  async createCategory(
    input: DocumentDefinition<CategoryMovieDocument>,
  ): Promise<CategoryMovie> {
    try {
      return this.categoryMovieRepository.createCategory(input);
    } catch (error) {
      this.throwError(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async getCountCategory() {
    try {
      return this.categoryMovieRepository.getCountCategory();
    } catch (error) {
      this.throwError(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async getAllCategory(reqBody): Promise<CategoryMovie[]> {
    try {
      return this.categoryMovieRepository.getAllCategory(reqBody);
    } catch (error) {
      this.throwError(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  filterCategory(
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
    try {
      const dataResult = await this.filterCategory(query, { lean: true });
      if (dataResult) {
        return this.categoryMovieRepository.updateCategory(
          query,
          update,
          options,
        );
      }
      this.throwError('Not found', HttpStatus.NOT_FOUND);
    } catch (error) {
      this.throwError(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async deleteCategory(id: string) {
    try {
      const dataResult = await this.filterCategory({ _id: id }, { lean: true });
      if (dataResult) {
        return this.categoryMovieRepository.deleteCategory(id);
      }
      this.throwError('Not found', HttpStatus.NOT_FOUND);
    } catch (error) {
      this.throwError(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
