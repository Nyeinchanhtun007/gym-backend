import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { PrismaService } from '../prisma/prisma.service';
import { QueryParamsDto } from '../common/dto/query-params.dto';

@Injectable()
export class ClassesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createClassDto: CreateClassDto) {
    return this.prisma.class.create({
      data: {
        ...createClassDto,
        schedule: new Date(createClassDto.schedule),
      },
    });
  }

  async findAll(query: QueryParamsDto) {
    const { page = 1, limit = 10, search, sortBy, sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.class.findMany({
        where,
        take: limit,
        skip,
        orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: sortOrder },
        include: {
          trainer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.class.count({ where }),
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
    const gymClass = await this.prisma.class.findUnique({
      where: { id },
      include: {
        trainer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        bookings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!gymClass) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }

    return gymClass;
  }

  async update(id: number, updateClassDto: UpdateClassDto) {
    const data = { ...updateClassDto } as any;
    if (updateClassDto.schedule) {
      data.schedule = new Date(updateClassDto.schedule);
    }

    try {
      return await this.prisma.class.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.class.delete({
        where: { id },
      });
      return { message: 'Class deleted successfully' };
    } catch (error) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }
  }
}
