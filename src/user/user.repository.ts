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

  createUser(input: DocumentDefinition<UserDocument>): Promise<User> {
    return this.userModel.create(input);
  }

  getAllUser(role: number, reqQuery) {
    const page = parseInt(reqQuery.page);
    const rowPerPage = parseInt(reqQuery.rowPerPage);
    return this.userModel.aggregate([
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
      {
        $skip: page ? page * rowPerPage - rowPerPage : 0,
      },
      { $limit: rowPerPage ? rowPerPage : 100 },
    ]);
  }

  deleteUser(id: string) {
    return this.userModel.findByIdAndDelete(id);
  }

  filterUser(
    query: FilterQuery<UserDocument>,
    options: QueryOptions = { lean: true },
  ) {
    return this.userModel.findOne(query, {}, options);
  }

  updateUser(
    query: FilterQuery<UserDocument>,
    update: UpdateQuery<UserDocument>,
    options: QueryOptions,
  ) {
    return this.userModel.findOneAndUpdate(query, update, options);
  }

  getCountUser() {
    return this.userModel.find().count();
  }
}
