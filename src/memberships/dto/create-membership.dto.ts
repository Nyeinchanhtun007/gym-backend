import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMembershipDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ example: '2025-01-01T00:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty({ example: 'Basic' })
  @IsString()
  @IsNotEmpty()
  planTier: string;

  @ApiProperty({ example: 'Monthly' })
  @IsString()
  @IsNotEmpty()
  billingCycle: string;

  @ApiProperty({ example: 'ACTIVE' })
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiProperty({ example: 49.99 })
  @IsNotEmpty()
  price: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  dailyClassLimit: number;

  @ApiProperty({ example: 10 })
  @IsInt()
  @IsNotEmpty()
  monthlyClassLimit: number;

  @ApiProperty({ example: 'Standard', required: false })
  @IsString()
  @IsOptional()
  nextPlanTier?: string;

  @ApiProperty({ example: 'Monthly', required: false })
  @IsString()
  @IsOptional()
  nextBillingCycle?: string;
}
