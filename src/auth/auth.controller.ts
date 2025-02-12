
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
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
    return this.authService.signIn(signInDto.username, signInDto.password);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
  @Post('signup')
  async signUp(@Body() signUpDto: Record<string, any>) {
    return this.authService.signUp(signUpDto.username, signUpDto.password);
  }
  @UseGuards(AuthGuard)
  @Post('follow')
  async followUser(
    @Body() followDto: { usernameToFollow: string },
    @Request() req
  ) {
    const currentUsername = req.user.username;
    console.log(followDto.usernameToFollow)
    await this.authService.followUser(currentUsername, followDto.usernameToFollow);
    return { message: `You are now following ${followDto.usernameToFollow}` };
  }
}
