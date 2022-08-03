import { HttpStatus, Injectable } from '@nestjs/common';
import { FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';
import { BaseResponse } from 'src/commons/base/base.response';
import { IPaging } from 'src/commons/interface';
import { hashPassword } from 'src/helpers';
import { User, UserDocument } from './schemas/user.schema';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService extends BaseResponse {
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
      this.throwError(error, HttpStatus.BAD_REQUEST);
    }
  }

  async checkUsernameDuplicated(reqBody: User): Promise<boolean> {
    try {
      const dataResult: UserDocument = await this.userRepository.filterUser({
        username: reqBody.username,
      });
      if (!dataResult) {
        return true;
      }
      return false;
    } catch (error) {
      this.throwError(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async getAllUser(role: number, reqQuery: IPaging): Promise<User[]> {
    try {
      return await this.userRepository.getAllUser(role, reqQuery);
    } catch (error) {
      this.throwError(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async deleteUser(id: string): Promise<User> {
    try {
      const userFound: UserDocument = await this.userRepository.filterUser({
        _id: id,
      });
      if (userFound) {
        return await this.userRepository.deleteUser(id);
      }
      this.throwError('Not found', HttpStatus.NOT_FOUND);
    } catch (error) {
      this.throwError(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async filterUser(
    query: FilterQuery<UserDocument>,
    options: QueryOptions = { lean: true },
  ) {
    try {
      return await this.userRepository.filterUser(query, options);
    } catch (error) {
      this.throwError(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async updateUser(
    query: FilterQuery<UserDocument>,
    update: UpdateQuery<UserDocument>,
    bypass?: boolean,
  ) {
    try {
      const dataResult: User = await this.userRepository.filterUser(query);
      if (dataResult) {
        if (!bypass) {
          if (update.username !== dataResult.username) {
            const password = await hashPassword(update.password);
            const dataUpdate = {
              ...update,
              password,
            };
            return await this.userRepository.updateUser(query, dataUpdate, {
              new: true,
            });
          }
          this.throwError('Not edit username', HttpStatus.BAD_REQUEST);
        }
        return await this.userRepository.updateUser(query, update, {
          new: true,
        });
      }
      this.throwError('Not found', HttpStatus.NOT_FOUND);
    } catch (error) {
      this.throwError(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async getCountUser() {
    try {
      return this.userRepository.getCountUser();
    } catch (error) {
      this.throwError(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
