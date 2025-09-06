// src/user/user.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '@app/database/entities/user.entity';
import { Role } from '@app/database/entities/role.entity';
import { UserRole } from '@app/database/entities/user-role.entity';


@Injectable()
export class UserServiceService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    @InjectRepository(UserRole) private userRoleRepo: Repository<UserRole>,
  ) {}

  async createUser(dto: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    roleName: string;
    organizationId: string;
  }) {
    // 1. Generate temp password
    const tempPassword = Math.random().toString(36).slice(-8); // simple example
    const hashedPassword = await bcrypt.hash(tempPassword, 10);


    //check if user exists
     const userExist = await this.userRepo.findOne({ where: { firstName: dto.firstName, lastName: dto.lastName, email: dto.email, } });

     if(userExist) {
      throw new Error('User already exist')
     }

    // 2. Create user
    const user = this.userRepo.create({
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      passwordHash: hashedPassword,
      mustChangePassword: true,
      isVerified: false,
    });
    await this.userRepo.save(user);

    // 3. Find role
    const role = await this.roleRepo.findOne({ where: { name: dto.roleName } });
    if (!role) throw new Error(`Role ${dto.roleName} not found`);

    // 4. Assign role
    const userRole = this.userRoleRepo.create({
      user,
      role,
      organizationId: dto.organizationId,
    });
    await this.userRoleRepo.save(userRole);

    // 5. Send email with temp password (pseudo-code)
    // await this.mailerService.sendWelcomeEmail(user.email, tempPassword);

    return { user, tempPassword }; // return for testing, in real life only email it
  }
}
