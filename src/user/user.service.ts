import { Injectable } from '@nestjs/common';
import { FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';
import { ErrorResponse } from 'src/commons/response/error';
import { hashPassword } from 'src/helpers';
import { User, UserDocument } from './schemas/user.schema';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService extends ErrorResponse {
  constructor(private userRepository: UserRepository) {
    super();
  }

  async createUser(reqBody: User): Promise<User> {
    try {
      const passwordHash = await hashPassword(reqBody.password);
      return await this.userRepository.createUser({
        ...reqBody,
        password: passwordHash,
      });
    } catch (error) {
      this.errorRes(error);
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
      this.errorRes(error);
    }
  }

  async getAllUser(role: number): Promise<User[]> {
    try {
      return await this.userRepository.getAllUser(role);
    } catch (error) {
      this.errorRes(error);
    }
  }

  async deleteUser(id: string): Promise<User> {
    try {
      return await this.userRepository.deleteUser(id);
    } catch (error) {
      this.errorRes(error);
    }
  }

  async filterUser(
    query: FilterQuery<UserDocument>,
    options: QueryOptions = { lean: true },
  ) {
    try {
      return await this.userRepository.filterUser(query, options);
    } catch (error) {
      this.errorRes(error);
    }
  }

  async updateUser(
    query: FilterQuery<UserDocument>,
    update: UpdateQuery<UserDocument>,
    login?: boolean,
  ) {
    try {
      const dataResult: User = await this.userRepository.filterUser(query);
      if (dataResult) {
        if (update.username !== '') {
          if (!login) {
            const password = await hashPassword(update.password);
            const dataUpdateBody = {
              ...update,
              password,
            };
            return await this.userRepository.updateUser(query, dataUpdateBody, {
              new: true,
            });
          }
          return await this.userRepository.updateUser(query, update, {
            new: true,
          });
        }
        this.errorRes('username is not edit');
      }
      this.errorRes('not found');
    } catch (error) {
      this.errorRes(error);
    }
  }
}
