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
import { IPaging } from '../commons/interface/index';

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  createUser(input: DocumentDefinition<UserDocument>): Promise<User> {
    return this.userModel.create(input);
  }

  getAllUser(role: number, reqQuery: IPaging) {
    const page = reqQuery.page;
    const rowPerPage = reqQuery.rowPerPage;
    const dataRes = this.userModel
      .find({
        role: { $gte: role },
      })
      .skip(page ? page * rowPerPage - rowPerPage : 0)
      .limit(rowPerPage ? rowPerPage : 100);
    return dataRes;
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
