import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { User, UserDocument } from './../user/schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';

export interface IGoogleOauth {
  sub: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

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
        expiresIn: process.env.EXPIRESIN_REFRESHTOKEN,
      }),
    };
  }

  async verifyToken(token: string) {
    try {
      const decode = this.jwtService.verify(token);
      return decode;
    } catch (error) {
      return null;
    }
  }

  async decodeToken(token: string) {
    try {
      return await this.verifyToken(token);
    } catch (e) {
      throw new Error();
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
      throw new ForbiddenException(
        "User already exists, but Google account was not connected to user's account",
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
      throw new Error(error);
    }
  }
}
