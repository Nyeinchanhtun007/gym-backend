import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AccountingService } from './accounting.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('accounting')
@ApiBearerAuth()
@Controller('accounting')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new transaction' })
  create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.accountingService.create(createTransactionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all transactions' })
  findAll() {
    return this.accountingService.findAll();
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get financial summary' })
  getSummary() {
    return this.accountingService.getSummary();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a transaction by id' })
  findOne(@Param('id') id: string) {
    return this.accountingService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a transaction' })
  update(@Param('id') id: string, @Body() updateTransactionDto: UpdateTransactionDto) {
    return this.accountingService.update(+id, updateTransactionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a transaction' })
  remove(@Param('id') id: string) {
    return this.accountingService.remove(+id);
  }
}
