import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { News, NewsDocument } from './schema/news.schema';
import mongoose, {
  DocumentDefinition,
  FilterQuery,
  Model,
  QueryOptions,
  UpdateQuery,
} from 'mongoose';
import {
  Category,
  CategoryDocument,
} from '../categories/schema/categories.schema';

@Injectable()
export class NewsService {
  constructor(
    @InjectModel(News.name) private newsModel: Model<NewsDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async createNews(input: DocumentDefinition<NewsDocument>): Promise<News> {
    try {
      return await this.newsModel.create(input);
    } catch (e) {
      throw new Error(e);
    }
  }

  async getAllNews(skip: number, limit: number) {
    return this.newsModel.aggregate([
      {
        $lookup: {
          from: 'categories',
          localField: 'categories',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'authors',
        },
      },
      {
        $project: {
          categories: 0,
          author: 0,
          'authors.username': 0,
          'authors.password': 0,
          'authors.refreshToken': 0,
          'category.userCreated': 0,
        },
      },
      { $skip: skip },
      { $limit: limit },
    ]);
  }

  async updateNews(
    query: FilterQuery<NewsDocument>,
    update: UpdateQuery<NewsDocument>,
    options: QueryOptions,
  ) {
    //lay ra news -> category news de so sanh
    const news: NewsDocument = await this.newsModel.findOne(query);

    // neu category khong thay doi
    if (news.categories === update.categories) {
      return this.newsModel.findOneAndUpdate(query, update, options);
    } else {
      //neu category thay doi
      //them news vao news[] trong category
      await this.categoryModel.findByIdAndUpdate(
        { _id: update.categories },
        { $push: { news: news._id.toString() } },
      );
      // xoa news trong news[] o du lieu cu
      await this.categoryModel.findByIdAndUpdate(
        { _id: news.categories },
        { $pull: { news: news._id.toString() } },
      );
      return this.newsModel.findOneAndUpdate(query, update, options);
    }
  }

  async convertStringToObjectId(id: string) {
    return new mongoose.Types.ObjectId(id);
  }

  async filterNews(query: FilterQuery<NewsDocument>) {
    if (query._id) {
      query = {
        _id: new mongoose.Types.ObjectId(query._id),
      };
    }
    return this.newsModel.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'categories',
          localField: 'categories',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'authors',
        },
      },
      {
        $project: {
          categories: 0,
          author: 0,
          'authors.username': 0,
          'authors.password': 0,
          'authors.refreshToken': 0,
          'category.userCreated': 0,
        },
      },
    ]);
  }

  async deleteNews(id: string): Promise<News> {
    const news: NewsDocument = await this.newsModel.findById(id);
    await this.categoryModel.findByIdAndUpdate(
      { _id: news.categories },
      { $pull: { news: news._id.toString() } },
    );
    return this.newsModel.findByIdAndDelete(id);
  }
}
