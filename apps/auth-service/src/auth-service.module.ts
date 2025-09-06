import { Role } from '@app/database/entities/role.entity';
import { User } from '@app/database/entities/user.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthServiceController } from './auth-service.controller';
import { AuthService } from '@app/auth/auth.service';
import { JwtStrategy } from './strategy/jwt.strategy';
import { LocalStrategy } from './strategy/local.strategy';
import { UserRole } from '@app/database/entities/user-role.entity';


@Module({
  imports: [TypeOrmModule.forFeature([User, UserRole, Role])],
  controllers: [AuthServiceController],
  providers: [AuthService, JwtStrategy, LocalStrategy],
  exports: [AuthService],
})
export class AuthModule {}