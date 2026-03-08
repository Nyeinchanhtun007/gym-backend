import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionType } from '@prisma/client';

@Injectable()
export class AccountingService {
  constructor(private prisma: PrismaService) {}

  async create(createTransactionDto: CreateTransactionDto) {
    return this.prisma.transaction.create({
      data: {
        ...createTransactionDto,
        date: createTransactionDto.date ? new Date(createTransactionDto.date) : new Date(),
      },
    });
  }

  async findAll() {
    return this.prisma.transaction.findMany({
      orderBy: {
        date: 'desc',
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.transaction.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateTransactionDto: UpdateTransactionDto) {
    return this.prisma.transaction.update({
      where: { id },
      data: {
        ...updateTransactionDto,
        date: updateTransactionDto.date ? new Date(updateTransactionDto.date) : undefined,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.transaction.delete({
      where: { id },
    });
  }

  async getCategories() {
    const transactions = await this.prisma.transaction.groupBy({
      by: ['category'],
    });
    return transactions.map((t) => t.category);
  }

  async getSummary() {
    const transactions = await this.prisma.transaction.findMany({
      orderBy: { date: 'asc' },
    });
    
    const income = transactions
      .filter((t) => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions
      .filter((t) => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = income - expenses;

    // Monthly data for charts
    const monthlySummary: Record<string, { month: string; income: number; expenses: number }> = {};
    
    transactions.forEach((t) => {
      const date = new Date(t.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlySummary[monthYear]) {
        monthlySummary[monthYear] = { month: monthYear, income: 0, expenses: 0 };
      }
      
      if (t.type === TransactionType.INCOME) {
        monthlySummary[monthYear].income += t.amount;
      } else {
        monthlySummary[monthYear].expenses += t.amount;
      }
    });

    return {
      totalIncome: income,
      totalExpenses: expenses,
      balance,
      monthly: Object.values(monthlySummary).sort((a, b) => a.month.localeCompare(b.month)),
      recentTransactions: [...transactions].reverse().slice(0, 5),
    };
  }
}

