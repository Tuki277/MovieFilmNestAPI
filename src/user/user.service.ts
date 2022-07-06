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
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async createUser(input: DocumentDefinition<UserDocument>): Promise<User> {
    try {
      return await this.userModel.create(input);
    } catch (error) {
      throw new Error(error);
    }
  }

  async getAllUser(): Promise<User[]> {
    return this.userModel.aggregate([
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
  }

  async deleteUser(id: string): Promise<User> {
    return this.userModel.findByIdAndDelete(id);
  }

  async filterUser(
    query: FilterQuery<UserDocument>,
    options: QueryOptions = { lean: true },
  ) {
    return this.userModel.findOne(query, {}, options);
  }

  async updateUser(
    query: FilterQuery<UserDocument>,
    update: UpdateQuery<UserDocument>,
    options: QueryOptions,
  ): Promise<User> {
    return this.userModel.findOneAndUpdate(query, update, options);
  }
}
