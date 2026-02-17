import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { PrismaService } from '../prisma/prisma.service';
import { QueryParamsDto } from '../common/dto/query-params.dto';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBookingDto: CreateBookingDto) {
    const { userId, classId } = createBookingDto;

    // Check if user exists
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

    // Check if class exists and has capacity
    const gymClass = await this.prisma.class.findUnique({
      where: { id: classId },
      include: { _count: { select: { bookings: true } } },
    });
    if (!gymClass) throw new NotFoundException(`Class with ID ${classId} not found`);

    if (gymClass._count.bookings >= gymClass.capacity) {
      throw new BadRequestException('Class is already full');
    }

    // Check for duplicate booking
    const existingBooking = await this.prisma.booking.findFirst({
      where: { userId, classId },
    });
    if (existingBooking) {
      throw new BadRequestException('User has already booked this class');
    }

    return this.prisma.booking.create({
      data: createBookingDto,
    });
  }

  async findAll(query: QueryParamsDto) {
    const { page = 1, limit = 10, search, sortBy, sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { class: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        take: limit,
        skip,
        orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: sortOrder },
        include: {
          user: { select: { id: true, name: true, email: true } },
          class: true,
        },
      }),
      this.prisma.booking.count({ where }),
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
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        class: true,
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    return booking;
  }

  async update(id: number, updateBookingDto: UpdateBookingDto) {
    try {
      return await this.prisma.booking.update({
        where: { id },
        data: updateBookingDto,
      });
    } catch (error) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.booking.delete({
        where: { id },
      });
      return { message: 'Booking deleted successfully' };
    } catch (error) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }
  }
}
