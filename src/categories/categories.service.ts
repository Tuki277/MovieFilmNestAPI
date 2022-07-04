import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Category, CategoryDocument } from './schema/categories.schema';
import {
  DocumentDefinition,
  FilterQuery,
  Model,
  QueryOptions,
  UpdateQuery,
} from 'mongoose';
import { NewsService } from '../news/news.service';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    private newsService: NewsService,
  ) {}

  async createCategory(
    input: DocumentDefinition<CategoryDocument>,
  ): Promise<Category> {
    try {
      return await this.categoryModel.create(input);
    } catch (e) {
      throw new Error(e);
    }
  }

  async getAllCategory(): Promise<Category[]> {
    return this.categoryModel.find();
  }

  async filterCategory(
    query: FilterQuery<CategoryDocument>,
    options: QueryOptions = { learn: true },
  ): Promise<Category> {
    return this.categoryModel.findOne(query, {}, options);
  }

  async updateCategory(
    query: FilterQuery<CategoryDocument>,
    update: UpdateQuery<CategoryDocument>,
    options: QueryOptions,
  ): Promise<Category> {
    return this.categoryModel.findOneAndUpdate(query, update, options);
  }

  async deleteCategory(id: string) {
    const dataResult = await this.categoryModel.findById(id);
    dataResult.news.forEach((x) => {
      this.newsService.deleteNews(x.toString());
    });
    return this.categoryModel.findByIdAndDelete(id);
  }
}
