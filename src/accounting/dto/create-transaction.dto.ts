import { IsNumber, IsString, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { TransactionType, TransactionCategory } from '@prisma/client';

export class CreateTransactionDto {
  @IsNumber()
  amount: number;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsEnum(TransactionCategory)
  category: TransactionCategory;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  date?: string;
}
