import { User } from '@app/database';
import { Role } from '@app/database/entities/role.entity';
import { UserRole } from '@app/database/entities/user-role.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';


@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async findAll(organizationId: string) {
    return this.userRepository.find({
      relations: ['userRoles', 'userRoles.role'],
      where: {
        userRoles: {
          organizationId,
          isActive: true,
        },
      },
      select: ['id', 'email', 'firstName', 'lastName', 'isActive', 'isVerified', 'createdAt'],
    });
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['userRoles', 'userRoles.role'],
      select: ['id', 'email', 'firstName', 'lastName', 'phone', 'isActive', 'isVerified', 'mfaEnabled'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      ...user,
      roles: user.userRoles.map(ur => ur.role.name),
      organizationId: user.userRoles[0]?.organizationId,
    };
  }

  async assignRole(userId: string, roleId: string, organizationId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const role = await this.roleRepository.findOne({ where: { id: roleId } });

    if (!user || !role) {
      throw new NotFoundException('User or Role not found');
    }

    const existingUserRole = await this.userRoleRepository.findOne({
      where: { userId, roleId, organizationId },
    });

    if (existingUserRole) {
      return { success: true, message: 'Role already assigned' };
    }

    const userRole = this.userRoleRepository.create({
      userId,
      roleId,
      organizationId,
    });

    await this.userRoleRepository.save(userRole);

    return { success: true, message: 'Role assigned successfully' };
  }

  async removeRole(userId: string, roleId: string, organizationId: string) {
    const result = await this.userRoleRepository.delete({
      userId,
      roleId,
      organizationId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('User role assignment not found');
    }

    return { success: true, message: 'Role removed successfully' };
  }

  async deactivateUser(id: string) {
    const result = await this.userRepository.update(id, { isActive: false });

    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }

    return { success: true, message: 'User deactivated successfully' };
  }

  async activateUser(id: string) {
    const result = await this.userRepository.update(id, { isActive: true });

    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }

    return { success: true, message: 'User activated successfully' };
  }
}