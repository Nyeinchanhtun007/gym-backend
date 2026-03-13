import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreatePaymentRequestDto {
  @IsNumber()
  userId: number;

  @IsString()
  planName: string;

  @IsNumber()
  @IsOptional()
  originalPrice?: number;

  @IsNumber()
  @IsOptional()
  autoDiscountAmount?: number;

  @IsString()
  @IsOptional()
  autoDiscountCode?: string;

  @IsNumber()
  price: number;

  @IsString()
  billingCycle: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsNumber()
  @IsOptional()
  dailyClassLimit?: number;

  @IsNumber()
  @IsOptional()
  monthlyClassLimit?: number;

  @IsString()
  payerName: string;

  @IsString()
  payerPhone: string;

  @IsString()
  paymentMethod: string;

  @IsString()
  @IsOptional()
  promoCode?: string;

  @IsNumber()
  @IsOptional()
  discountAmount?: number;

  @IsString()
  @IsOptional()
  paymentProof?: string;
}
