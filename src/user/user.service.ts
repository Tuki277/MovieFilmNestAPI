import { Injectable } from '@nestjs/common';
import { FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';
import { hashPassword } from 'src/helpers';
import { User, UserDocument } from './schemas/user.schema';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async createUser(reqBody: User): Promise<User> {
    try {
      const passwordHash = await hashPassword(reqBody.password);
      return await this.userRepository.createUser({
        ...reqBody,
        password: passwordHash,
      });
    } catch (error) {
      throw new Error(error);
    }
  }

  async checkUsernameDuplicated(reqBody: User): Promise<boolean> {
    try {
      const dataResult = await this.userRepository.filterUser({
        username: reqBody.username,
      });
      if (!dataResult) {
        return true;
      }
      return false;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getAllUser(role: number): Promise<User[]> {
    try {
      return await this.userRepository.getAllUser(role);
    } catch (error) {
      throw new Error(error);
    }
  }

  async deleteUser(id: string): Promise<User> {
    try {
      return await this.userRepository.deleteUser(id);
    } catch (error) {
      throw new Error(error);
    }
  }

  async filterUser(
    query: FilterQuery<UserDocument>,
    options: QueryOptions = { lean: true },
  ) {
    try {
      return await this.userRepository.filterUser(query, options);
    } catch (error) {
      throw new Error(error);
    }
  }

  async updateUser(
    query: FilterQuery<UserDocument>,
    update: UpdateQuery<UserDocument>,
  ) {
    try {
      const dataResult: User = await this.userRepository.filterUser(query);
      if (dataResult) {
        if (update.username !== '') {
          const password = await hashPassword(update.password);
          const dataUpdateBody = {
            ...update,
            password,
          };
          return await this.userRepository.updateUser(query, dataUpdateBody, {
            new: true,
          });
        }
        throw new Error('username is not edit');
      }
      throw new Error('not found');
    } catch (error) {
      throw new Error(error);
    }
  }
}
