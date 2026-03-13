import { IsString, IsOptional, IsEnum } from 'class-validator';

export enum PaymentAction {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class ReviewPaymentRequestDto {
  @IsEnum(PaymentAction)
  status: PaymentAction;

  @IsString()
  @IsOptional()
  adminNote?: string;
}
