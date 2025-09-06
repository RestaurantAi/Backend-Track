// apps/user-service/src/user-service.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RoleSeedService } from './seed/role.seed';

import { UserServiceController } from './user-service.controller';
import { UserRole } from '@app/database/entities/user-role.entity';
import { Role } from '@app/database/entities/role.entity';
import { User } from '@app/database/entities/user.entity';
import { UserServiceService } from './user-service.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: [User, Role, UserRole],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User, Role, UserRole]),
  ],
  controllers: [UserServiceController],
  providers: [UserServiceService, RoleSeedService], 
})
export class UserServiceModule {}
