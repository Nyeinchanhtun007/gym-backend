import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMembershipPlanDto } from './dto/create-membership-plan.dto';
import { UpdateMembershipPlanDto } from './dto/update-membership-plan.dto';

@Injectable()
export class MembershipPlansService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createMembershipPlanDto: CreateMembershipPlanDto) {
    return this.prisma.membershipPlan.create({
      data: createMembershipPlanDto,
    });
  }

  async findAll() {
    return this.prisma.membershipPlan.findMany({
      orderBy: { monthlyPrice: 'asc' },
    });
  }

  async findOne(id: number) {
    const plan = await this.prisma.membershipPlan.findUnique({
      where: { id },
    });
    if (!plan) {
      throw new NotFoundException(`Membership Plan with ID ${id} not found`);
    }
    return plan;
  }

  async update(id: number, updateMembershipPlanDto: UpdateMembershipPlanDto) {
    try {
      return await this.prisma.membershipPlan.update({
        where: { id },
        data: updateMembershipPlanDto,
      });
    } catch (error) {
      throw new NotFoundException(`Membership Plan with ID ${id} not found`);
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.membershipPlan.delete({
        where: { id },
      });
      return { message: 'Membership Plan deleted successfully' };
    } catch (error) {
      throw new NotFoundException(`Membership Plan with ID ${id} not found`);
    }
  }
}
