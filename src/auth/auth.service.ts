
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
    const payload = { id: user.id, name: user.name };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

}
