import { IsString, IsNumber, IsOptional, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMembershipPlanDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsNumber()
  monthlyPrice: number;

  @ApiProperty()
  @IsNumber()
  yearlyPrice: number;

  @ApiProperty({ default: 0 })
  @IsNumber()
  @IsOptional()
  discount?: number;

  @ApiProperty()
  @IsNumber()
  dailyClassLimit: number;

  @ApiProperty()
  @IsNumber()
  monthlyClassLimit: number;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  features: string[];

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  isPopular?: boolean;
}
