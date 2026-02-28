import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { MembershipPlansService } from './membership-plans.service';
import { CreateMembershipPlanDto } from './dto/create-membership-plan.dto';
import { UpdateMembershipPlanDto } from './dto/update-membership-plan.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('membership-plans')
@Controller('membership-plans')
export class MembershipPlansController {
  constructor(private readonly membershipPlansService: MembershipPlansService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a membership plan (Admin only)' })
  create(@Body() createMembershipPlanDto: CreateMembershipPlanDto) {
    return this.membershipPlansService.create(createMembershipPlanDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all membership plans' })
  findAll() {
    return this.membershipPlansService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a membership plan by ID' })
  findOne(@Param('id') id: string) {
    return this.membershipPlansService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a membership plan (Admin only)' })
  update(@Param('id') id: string, @Body() updateMembershipPlanDto: UpdateMembershipPlanDto) {
    return this.membershipPlansService.update(+id, updateMembershipPlanDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a membership plan (Admin only)' })
  remove(@Param('id') id: string) {
    return this.membershipPlansService.remove(+id);
  }
}
