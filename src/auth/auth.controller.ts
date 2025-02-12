
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Request,
  UseGuards
} from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: Record<string, any>) {
    return this.authService.signIn(signInDto.name, signInDto.password);
  }
  @UseGuards(AuthGuard)

  @Get('search')
  async search(@Query('q') query: string) {
    console.log(query, 'query')
    return this.authService.searchUsers(query);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
  @Post('signup')
  async signUp(@Body() signUpDto: Record<string, any>) {
    return this.authService.signUp(signUpDto.name, signUpDto.surname, signUpDto.email, signUpDto.password, signUpDto.age);
  }
  @UseGuards(AuthGuard)
  @Post('follow')
  async followUser(
    @Body() followDto: { usernameToFollow: string },
    @Request() req
  ) {
    const currentUsername = req.user.name;
    await this.authService.followUser(currentUsername, followDto.usernameToFollow);
    return { message: `You are now following ${followDto.usernameToFollow}` };
  }

}
