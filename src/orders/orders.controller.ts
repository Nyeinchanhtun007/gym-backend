import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { OrdersService } from './orders.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Place a new order' })
  create(@Request() req: any, @Body() data: { items: { productId: number; quantity: number }[] }) {
    return this.ordersService.create(req.user.id, data.items);
  }

  @Get('my-orders')
  @ApiOperation({ summary: 'Get current user orders' })
  getMyOrders(@Request() req: any) {
    return this.ordersService.findByUser(req.user.id);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all orders (Admin)' })
  findAll() {
    return this.ordersService.findAll();
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update order status (Admin)' })
  updateStatus(@Param('id') id: string, @Body() data: { status: string }) {
    return this.ordersService.updateStatus(+id, data.status);
  }
}
