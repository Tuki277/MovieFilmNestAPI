import { Injectable } from '@nestjs/common';
import {
  DocumentDefinition,
  FilterQuery,
  QueryOptions,
  UpdateQuery,
} from 'mongoose';
import { hashPassword } from 'src/helpers';
import { User, UserDocument } from './schemas/user.schema';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async createUser(input: DocumentDefinition<UserDocument>): Promise<User> {
    try {
      return await this.userRepository.createUser(input);
    } catch (error) {
      throw new Error(error);
    }
  }

  async getAllUser(role: number): Promise<User[]> {
    return await this.userRepository.getAllUser(role);
  }

  async deleteUser(id: string): Promise<User> {
    return this.userRepository.deleteUser(id);
  }

  async filterUser(
    query: FilterQuery<UserDocument>,
    options: QueryOptions = { lean: true },
  ) {
    return this.userRepository.filterUser(query, options);
  }

  async updateUser(
    query: FilterQuery<UserDocument>,
    update: UpdateQuery<UserDocument>,
  ) {
    const dataResult: User = await this.userRepository.filterUser(query);
    if (dataResult) {
      if (update.username !== '') {
        const password = await hashPassword(update.password);
        const dataUpdateBody = {
          ...update,
          password,
        };
        await this.userRepository.updateUser(query, dataUpdateBody, {
          new: true,
        });
        return true;
      } else {
        return false;
      }
    }
    return 0;
  }
}
