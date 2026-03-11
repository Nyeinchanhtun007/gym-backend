import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';

@Injectable()
export class DiscountsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDiscountDto) {
    const existing = await this.prisma.discount.findUnique({
      where: { code: dto.code.toUpperCase() },
    });
    if (existing) {
      throw new BadRequestException(`Discount code "${dto.code}" already exists`);
    }
    return this.prisma.discount.create({
      data: {
        ...dto,
        code: dto.code.toUpperCase(),
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      },
    });
  }

  async findAll(search?: string, activeOnly?: boolean) {
    return this.prisma.discount.findMany({
      where: {
        ...(search
          ? {
              OR: [
                { code: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
        ...(activeOnly ? { isActive: true } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const discount = await this.prisma.discount.findUnique({ where: { id } });
    if (!discount) throw new NotFoundException('Discount not found');
    return discount;
  }

  async findByCode(code: string, userId?: number) {
    const discount = await this.prisma.discount.findUnique({
      where: { code: code.toUpperCase() },
      include: userId ? {
        usages: {
          where: { userId }
        }
      } : undefined
    });

    if (!discount) throw new NotFoundException('Discount code not found');
    if (!discount.isActive) throw new BadRequestException('Discount code is inactive');
    
    const now = new Date();
    if (discount.startDate && now < discount.startDate) {
      throw new BadRequestException('Discount code is not active yet');
    }
    if (discount.expiresAt && now > discount.expiresAt) {
      throw new BadRequestException('Discount code has expired');
    }
    if (discount.maxUses !== null && discount.usedCount >= discount.maxUses) {
      throw new BadRequestException('Discount code total usage limit reached');
    }

    if (userId && discount.perUserLimit !== null) {
      const userUsageCount = (discount as any).usages?.length || 0;
      if (userUsageCount >= (discount.perUserLimit || 0)) {
        throw new BadRequestException('Your usage limit for this discount code has been reached');
      }
    }

    return discount;
  }

  async update(id: number, dto: UpdateDiscountDto) {
    await this.findOne(id);

    if (dto.code) {
      const existing = await this.prisma.discount.findFirst({
        where: { code: dto.code.toUpperCase(), NOT: { id } },
      });
      if (existing) {
        throw new BadRequestException(`Discount code "${dto.code}" already exists`);
      }
    }

    return this.prisma.discount.update({
      where: { id },
      data: {
        ...dto,
        code: dto.code ? dto.code.toUpperCase() : undefined,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.discount.delete({ where: { id } });
  }

  async getSummary() {
    const [total, active, expired] = await Promise.all([
      this.prisma.discount.count(),
      this.prisma.discount.count({ where: { isActive: true } }),
      this.prisma.discount.count({
        where: { expiresAt: { lt: new Date() } },
      }),
    ]);
    const totalUsage = await this.prisma.discount.aggregate({
      _sum: { usedCount: true },
    });
    return {
      total,
      active,
      expired,
      totalUsage: totalUsage._sum.usedCount || 0,
    };
  }
}
