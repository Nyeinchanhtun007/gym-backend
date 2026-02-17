import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateClassDto {
  @ApiProperty({ example: 'Yoga for Beginners' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'A relaxing yoga session', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  trainerId: number;

  @ApiProperty({ example: '2024-10-30T10:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  schedule: string;

  @ApiProperty({ example: 20 })
  @IsInt()
  @Min(1)
  capacity: number;
}
