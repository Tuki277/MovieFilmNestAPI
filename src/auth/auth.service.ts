import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { User, UserDocument } from './../user/schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { BaseResponse } from 'src/commons/base/base.response';
import { IGoogleOauth } from 'src/commons/interface';

@Injectable()
export class AuthService extends BaseResponse {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {
    super();
  }

  async validatePassword(candidatePassword: string, users: UserDocument) {
    const user: UserDocument = await this.userModel.findOne({
      username: users.username,
    });
    if (!user) {
      return false;
    }
    const isValid = await bcrypt.compare(candidatePassword, user.password);
    if (!isValid) {
      return false;
    }
    return true;
  }

  async login(user) {
    const payload = {
      id: user.username,
      username: user.fullname,
      address: user.address,
    };
    return {
      access_token: this.jwtService.sign(payload, {
        expiresIn: process.env.EXPIRES_IN_REFRESH_TOKEN,
      }),
    };
  }

  async verifyToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      this.throwError(error, HttpStatus.BAD_REQUEST);
    }
  }

  async decodeToken(token: string) {
    try {
      return await this.verifyToken(token);
    } catch (error) {
      this.throwError(error, HttpStatus.BAD_REQUEST);
    }
  }

  async signInWithGoogle(data) {
    if (!data.user) {
      throw new BadRequestException();
    }
    let user: IGoogleOauth[] = await this.userModel.find({
      username: data.user.profile.id,
    });
    if (user.length > 0) {
      return this.login(user[0]);
    }
    user = await this.userModel.find({
      fullname: data.user.email,
    });

    if (user.length > 0) {
      this.throwError(
        "User already exists, but Google account was not connected to user's account",
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const newUser: User = new User();
      newUser.fullname = data.user.email;
      newUser.username = data.user.profile.id;
      newUser.address = 'Google';
      newUser.age = 18;
      this.userModel.create(newUser);
      return this.login(newUser);
    } catch (error) {
      this.throwError(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
