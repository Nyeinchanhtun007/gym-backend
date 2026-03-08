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
  async create(@Body() createTransactionDto: CreateTransactionDto) {
    console.log("INCOMING PROTOCOL:", createTransactionDto);
    try {
      const result = await this.accountingService.create(createTransactionDto);
      console.log("PROTOCOL SUCCESS:", result.id);
      return result;
    } catch (e) {
      console.error("PROTOCOL FAILURE:", e);
      throw e;
    }
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

  @Get('categories')
  @ApiOperation({ summary: 'Get all transaction categories' })
  getCategories() {
    return this.accountingService.getCategories();
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
