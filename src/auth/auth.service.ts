
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

  async signUp(name: string, surname: string, email: string, password: string, age: number,): Promise<{ message: string }> {
    console.log(name, surname, email, password, age)
    const existingUser = await this.usersService.findOne(name);
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await this.usersService.createUser(name, surname, email, hashedPassword, age);

    return { message: 'User registered successfully' };
  }

  async signIn(
    name: string,
    pass: string,
  ): Promise<{ access_token: string }> {
    const user = await this.usersService.findOne(name);
    if (user?.password !== pass) {
      throw new UnauthorizedException();
    }
    const payload = { sub: user.userId, name: user.name };
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
    await this.usersService.followUser(currentUser.userid, userToFollow.userid);
  }

  async searchUsers(query: string): Promise<any[]> {
    const result = await this.usersService.searchUsers(query)
    return result;
  }

}
