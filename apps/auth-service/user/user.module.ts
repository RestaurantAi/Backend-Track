import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';


import { User } from '@app/database';
import { UserRole } from '@app/database/entities/user-role.entity';
import { Role } from '@app/database/entities/role.entity';
import { UsersService } from './user.service';
import { UsersController } from './user.controller';


@Module({
  imports: [TypeOrmModule.forFeature([User, UserRole, Role])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}