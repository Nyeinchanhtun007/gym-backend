import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsArray,
  IsDateString,
  Min,
} from 'class-validator';

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
}

export class CreateDiscountDto {
  @IsString()
  code: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(DiscountType)
  @IsOptional()
  type?: DiscountType;

  @IsNumber()
  @Min(0)
  value: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  minPurchase?: number;

  @IsNumber()
  @IsOptional()
  maxUses?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsDateString()
  @IsOptional()
  expiresAt?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  applicableTo?: string[];

  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  @IsBoolean()
  @IsOptional()
  isAutomatic?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(1)
  recurringDuration?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  perUserLimit?: number;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsOptional()
  additionalConditions?: any;
}
