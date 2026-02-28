import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { QueryParamsDto } from '../common/dto/query-params.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('bookings')
@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new class booking' })
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Booking created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request (e.g. class full, duplicate booking)' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User or Class not found' })
  create(@Body() createBookingDto: CreateBookingDto, @Req() req: any) {
    // Force the userId to be the authenticated user's ID
    if (req.user.role !== Role.ADMIN) {
      createBookingDto.userId = req.user.id;
    }
    return this.bookingsService.create(createBookingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bookings with search, sort and pagination' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Query() query: QueryParamsDto, @Req() req: any) {
    let finalQuery: any = { ...query };
    if (req.user.role !== Role.ADMIN) {
      finalQuery.userId = req.user.id;
    }
    return this.bookingsService.findAll(finalQuery);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking by ID' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update booking by ID' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Booking updated successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
    return this.bookingsService.update(+id, updateBookingDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete booking by ID' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Booking deleted successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async remove(@Param('id') id: string, @Req() req: any) {
    if (req.user.role !== Role.ADMIN) {
      const booking = await this.bookingsService.findOne(+id);
      if (booking.userId !== req.user.id) {
        throw new UnauthorizedException('You can only delete your own bookings');
      }
    }
    return this.bookingsService.remove(+id);
  }
}
