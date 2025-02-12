
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './user.controller'
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule { }
