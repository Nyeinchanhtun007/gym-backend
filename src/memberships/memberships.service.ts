import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { UpdateMembershipDto } from './dto/update-membership.dto';
import { PrismaService } from '../prisma/prisma.service';
import { QueryParamsDto } from '../common/dto/query-params.dto';

@Injectable()
export class MembershipsService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly planTiers: Record<string, number> = {
    Basic: 1,
    Standard: 2,
    Premium: 3,
  };

  async create(createMembershipDto: CreateMembershipDto) {
    const { userId, planTier, billingCycle } = createMembershipDto;

    // Check for existing active membership
    const activeMembership = await this.prisma.membership.findFirst({
      where: {
        userId,
        status: { in: ['ACTIVE', 'PENDING_DOWNGRADE'] },
      },
    });

    if (activeMembership) {
      const currentTierRank =
        this.planTiers[(activeMembership as any).planTier] || 0;
      const newTierRank = this.planTiers[planTier] || 0;

      if (newTierRank > currentTierRank) {
        // Instant Upgrade: Cancel current and start new one now
        await this.prisma.membership.update({
          where: { id: activeMembership.id },
          data: { status: 'CANCELLED' } as any,
        });
        // Proceed to create new membership
      } else if (newTierRank < currentTierRank) {
        // Scheduled Downgrade: Flag current one to change at end date
        return this.prisma.membership.update({
          where: { id: activeMembership.id },
          data: {
            status: 'PENDING_DOWNGRADE',
            nextPlanTier: planTier,
            nextBillingCycle: billingCycle,
          } as any,
        });
      } else {
        throw new BadRequestException(
          'User already has an active membership of this tier',
        );
      }
    }

    // Create new membership (or upgraded one)
    return this.prisma.membership.create({
      data: {
        ...createMembershipDto,
        startDate: new Date(createMembershipDto.startDate),
        endDate: new Date(createMembershipDto.endDate),
      } as any,
    });
  }

  async findAll(query: QueryParamsDto) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy,
      sortOrder = 'desc',
      status,
    } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { planTier: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    let orderBy: any = {};
    if (sortBy === 'user') {
      orderBy = { user: { name: sortOrder } };
    } else if (sortBy === 'tier') {
      orderBy = { planTier: sortOrder };
    } else if (sortBy) {
      orderBy = { [sortBy]: sortOrder };
    } else {
      orderBy = { createdAt: sortOrder };
    }

    const [items, total] = await Promise.all([
      this.prisma.membership.findMany({
        where,
        take: limit,
        skip,
        orderBy,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.membership.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const membership = await this.prisma.membership.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!membership) {
      throw new NotFoundException(`Membership with ID ${id} not found`);
    }

    return membership;
  }

  async update(id: number, updateMembershipDto: UpdateMembershipDto) {
    const data = { ...updateMembershipDto } as any;
    if (updateMembershipDto.startDate) {
      data.startDate = new Date(updateMembershipDto.startDate);
    }
    if (updateMembershipDto.endDate) {
      data.endDate = new Date(updateMembershipDto.endDate);
    }

    try {
      return await this.prisma.membership.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new NotFoundException(`Membership with ID ${id} not found`);
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.membership.delete({
        where: { id },
      });
      return { message: 'Membership deleted successfully' };
    } catch (error) {
      throw new NotFoundException(`Membership with ID ${id} not found`);
    }
  }
}
