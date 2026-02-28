import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { QueryParamsDto } from '../common/dto/query-params.dto';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) { }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByOAuthId(provider: 'google' | 'facebook', oauthId: string) {
    return this.prisma.user.findUnique({
      where: provider === 'google' ? { googleId: oauthId } : { facebookId: oauthId },
    });
  }

  async findOrCreate(data: { email: string; name: string; googleId?: string; facebookId?: string }) {
    const user = await this.findByEmail(data.email);
    if (user) {
      // Update user with OAuth IDs if they don't have them
      if (data.googleId && !user.googleId) {
        return this.prisma.user.update({
          where: { id: user.id },
          data: { googleId: data.googleId },
        });
      }
      if (data.facebookId && !user.facebookId) {
        return this.prisma.user.update({
          where: { id: user.id },
          data: { facebookId: data.facebookId },
        });
      }
      return user;
    }

    return this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        googleId: data.googleId,
        facebookId: data.facebookId,
        password: null, // Password not needed for OAuth users
        role: Role.USER,
      },
    });
  }

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    let hashedPassword = undefined;
    if (createUserDto.password) {
      hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    }

    return this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
        role: (createUserDto.role as Role) || Role.USER,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        photo: true,
        createdAt: true,
      },
    });
  }

  async findAll(query: QueryParamsDto) {
    const { page = 1, limit = 10, search, sortBy, sortOrder = 'desc', role, plan } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (role) {
      where.role = role;
    }
    if (plan) {
      where.memberships = {
        some: {
          planTier: plan,
          status: 'ACTIVE',
        },
      };
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        take: limit,
        skip,
        orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: sortOrder },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          photo: true,
          createdAt: true,
          memberships: {
            where: {
              status: 'ACTIVE',
            },
            select: {
              planTier: true,
            },
          },
          classes: {
            select: {
              id: true,
              name: true,
              schedule: true,
            }
          },
        },
      }),
      this.prisma.user.count({ where }),
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
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        photo: true,
        createdAt: true,
        memberships: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    try {
      return await this.prisma.user.update({
        where: { id },
        data: updateUserDto as any,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          photo: true,
          updatedAt: true,
        },
      });
    } catch (error) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        // 1. Delete user's own bookings
        await tx.booking.deleteMany({ where: { userId: id } });
        
        // 2. Delete user's memberships
        await tx.membership.deleteMany({ where: { userId: id } });

        // 3. Handle classes if caller is a trainer
        const trainerClasses = await tx.class.findMany({ 
          where: { trainerId: id },
          select: { id: true }
        });
        
        if (trainerClasses.length > 0) {
          const classIds = trainerClasses.map(c => c.id);
          // Delete all bookings for this trainer's classes
          await tx.booking.deleteMany({
            where: { classId: { in: classIds } }
          });
          // Delete the classes themselves
          await tx.class.deleteMany({
            where: { trainerId: id }
          });
        }

        // 4. Finally delete the user
        await tx.user.delete({
          where: { id },
        });

        return { message: 'User record and all associated data purged successfully' };
      });
    } catch (error) {
      console.error('Purge Error:', error);
      throw new ConflictException(
        `Critical Failure: Could not purge user ${id}. System was unable to resolve all dependencies automatically.`
      );
    }
  }
}
