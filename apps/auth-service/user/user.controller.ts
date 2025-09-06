import { Roles } from '@app/common/decorators/roles.decorator';
import { JwtAuthGuard } from '@app/common/gaurds';
import { RolesGuard } from '@app/common/gaurds/role.guard';
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './user.service';


@ApiTags('Users')
@Controller('api/v1/users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Get all users in organization' })
  async findAll(@Request() req) {
    return this.usersService.findAll(req.user.organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post(':id/roles')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Assign role to user' })
  async assignRole(
    @Param('id') userId: string,
    @Body() { roleId }: { roleId: string },
    @Request() req,
  ) {
    return this.usersService.assignRole(userId, roleId, req.user.organizationId);
  }

  @Delete(':id/roles/:roleId')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Remove role from user' })
  async removeRole(
    @Param('id') userId: string,
    @Param('roleId') roleId: string,
    @Request() req,
  ) {
    return this.usersService.removeRole(userId, roleId, req.user.organizationId);
  }

  @Put(':id/deactivate')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Deactivate user' })
  async deactivateUser(@Param('id') id: string) {
    return this.usersService.deactivateUser(id);
  }

  @Put(':id/activate')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Activate user' })
  async activateUser(@Param('id') id: string) {
    return this.usersService.activateUser(id);
  }
}




