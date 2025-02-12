
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './user.controller'

@Module({
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule { }
