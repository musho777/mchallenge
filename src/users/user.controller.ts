
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
import { UsersService } from './users.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('user')
export class UsersController {
  constructor(private usersService: UsersService) { }

  @HttpCode(HttpStatus.OK)

  @Get('search')
  async search(@Query('q') query: string) {
    console.log(query, 'query')
    return this.usersService.searchUsers(query);
  }

  @UseGuards(AuthGuard)
  @Post('follow')
  async followUser(
    @Body() followDto: { userIdToFollow: number },
    @Request() req
  ) {
    const currentUsername = req.user.id;
    await this.usersService.followUser(currentUsername, followDto.userIdToFollow);
    return { message: `You are now following ${followDto.userIdToFollow}` };
  }
  @UseGuards(AuthGuard)
  @Post('acceptFriend')
  async acceptFriendRequest(
    @Body() followDto: { userIdToFollow: number },
    @Request() req
  ) {
    const currentUsername = req.user.id;
    await this.usersService.acceptFriendRequest(followDto.userIdToFollow, currentUsername,);
    return { message: `You are now following this user.` };
  }
  @UseGuards(AuthGuard)
  @Post('declineFriend')
  async declineFriendRequest(
    @Body() followDto: { userIdToFollow: number },
    @Request() req
  ) {
    const currentUsername = req.user.id;
    await this.usersService.declineFriendRequest(followDto.userIdToFollow, currentUsername,);
    return { message: `You have declined the friend request.` };
  }
  @UseGuards(AuthGuard)
  @Get('getPendingRequests')
  async getPendingRequests(
    @Request() req
  ) {
    const currentUserID = req.user.id;
    const data = await this.usersService.getPendingRequests(currentUserID);
    return { data };
  }

}
