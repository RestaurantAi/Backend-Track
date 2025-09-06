// src/seed/role.seed.ts
import { Role } from '@app/database/entities/role.entity';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';


@Injectable()
export class RoleSeedService implements OnModuleInit {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
  ) {}

  async onModuleInit() {
    const roles = [
      { name: 'Admin', description: 'Full system access' },
      { name: 'HR', description: 'Manages employees and payroll' },
      { name: 'Manager', description: 'Oversees operations' },
      { name: 'Employee', description: 'Regular staff member' },
    ];

    for (const role of roles) {
      const exists = await this.roleRepo.findOne({ where: { name: role.name } });
      if (!exists) {
        await this.roleRepo.save(this.roleRepo.create(role));
      }
    }
  }
}
