
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) { }

  async signUp(username: string, pass: string): Promise<{ message: string }> {
    const existingUser = await this.usersService.findOne(username);
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    const hashedPassword = pass;
    await this.usersService.createUser(username, hashedPassword);

    return { message: 'User registered successfully' };
  }
  async signIn(
    username: string,
    pass: string,
  ): Promise<{ access_token: string }> {
    const user = await this.usersService.findOne(username);
    if (user?.password !== pass) {
      throw new UnauthorizedException();
    }
    const payload = { sub: user.userId, username: user.username };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async followUser(
    currentUsername: string,
    usernameToFollow: string
  ): Promise<void> {
    const currentUser = await this.usersService.findOne(currentUsername);
    const userToFollow = await this.usersService.findOne(usernameToFollow);
    if (!currentUser || !userToFollow) {
      throw new UnauthorizedException('User not found');
    }

    // Call the UsersService to add the follower
    await this.usersService.followUser(currentUser.userid, userToFollow.userid);
  }

}
