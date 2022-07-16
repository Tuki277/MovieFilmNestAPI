import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  DocumentDefinition,
  FilterQuery,
  Model,
  QueryOptions,
  UpdateQuery,
} from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async createUser(input: DocumentDefinition<UserDocument>): Promise<User> {
    try {
      return await this.userModel.create(input);
    } catch (error) {
      throw new Error(error);
    }
  }

  async getAllUser(role: number): Promise<User[]> {
    try {
      return await this.userModel.aggregate([
        { $match: { role: { $gte: role } } },
        {
          $project: {
            username: 1,
            fullname: 1,
            age: 1,
            address: 1,
            movieView: 1,
            movie: 1,
            role: 1,
            createdAt: 1,
            movieUpload: {
              $cond: {
                if: { $isArray: '$movie' },
                then: { $size: '$movie' },
                else: 0,
              },
            },
          },
        },
      ]);
    } catch (error) {
      throw new Error(error);
    }
  }

  async deleteUser(id: string): Promise<User> {
    try {
      return await this.userModel.findByIdAndDelete(id);
    } catch (error) {
      throw new Error(error);
    }
  }

  async filterUser(
    query: FilterQuery<UserDocument>,
    options: QueryOptions = { lean: true },
  ) {
    try {
      return await this.userModel.findOne(query, {}, options);
    } catch (error) {
      throw new Error(error);
    }
  }

  async updateUser(
    query: FilterQuery<UserDocument>,
    update: UpdateQuery<UserDocument>,
    options: QueryOptions,
  ): Promise<User> {
    try {
      return await this.userModel.findOneAndUpdate(query, update, options);
    } catch (error) {
      throw new Error(error);
    }
  }
}
