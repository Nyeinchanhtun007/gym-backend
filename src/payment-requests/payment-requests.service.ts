import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentRequestDto } from './dto/create-payment-request.dto';
import { ReviewPaymentRequestDto } from './dto/review-payment-request.dto';

@Injectable()
export class PaymentRequestsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePaymentRequestDto) {
    return this.prisma.paymentRequest.create({
      data: {
        userId: dto.userId,
        planName: dto.planName,
        originalPrice: dto.originalPrice || (dto.price + (dto.discountAmount || 0) + (dto.autoDiscountAmount || 0)),
        autoDiscountAmount: dto.autoDiscountAmount || 0,
        autoDiscountCode: dto.autoDiscountCode,
        price: dto.price,
        billingCycle: dto.billingCycle,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        dailyClassLimit: dto.dailyClassLimit || 0,
        monthlyClassLimit: dto.monthlyClassLimit || 0,
        payerName: dto.payerName,
        payerPhone: dto.payerPhone,
        paymentMethod: dto.paymentMethod,
        promoCode: dto.promoCode,
        discountAmount: dto.discountAmount || 0,
        paymentProof: dto.paymentProof,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  async findAll(status?: string) {
    return this.prisma.paymentRequest.findMany({
      where: status ? { status: status as any } : undefined,
      include: { user: { select: { id: true, name: true, email: true, photo: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const request = await this.prisma.paymentRequest.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true, photo: true } } },
    });
    if (!request) throw new NotFoundException('Payment request not found');
    return request;
  }

  async getPendingCount() {
    const count = await this.prisma.paymentRequest.count({
      where: { status: 'PENDING' },
    });
    return { count };
  }

  async review(id: number, dto: ReviewPaymentRequestDto) {
    const request = await this.findOne(id);

    if (request.status !== 'PENDING') {
      throw new BadRequestException('This payment request has already been reviewed');
    }

    // Update the payment request status
    const updated = await this.prisma.paymentRequest.update({
      where: { id },
      data: {
        status: dto.status,
        adminNote: dto.adminNote,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    // If approved, create the membership and accounting record
    if (dto.status === 'APPROVED') {
      await this.prisma.membership.create({
        data: {
          userId: request.userId,
          planTier: request.planName,
          billingCycle: request.billingCycle,
          startDate: request.startDate,
          endDate: request.endDate,
          status: 'ACTIVE',
          originalPrice: request.originalPrice,
          autoDiscountAmount: request.autoDiscountAmount,
          autoDiscountCode: request.autoDiscountCode,
          price: request.price,
          dailyClassLimit: request.dailyClassLimit,
          monthlyClassLimit: request.monthlyClassLimit,
          promoCode: request.promoCode,
          discountAmount: request.discountAmount,
        },
      });

      await this.prisma.transaction.create({
        data: {
          amount: request.price,
          type: 'INCOME',
          category: 'MEMBERSHIP',
          description: `Subscription to ${request.planName} (${request.billingCycle}) by ${request.user.email}${request.promoCode ? ` | Promo: ${request.promoCode} (-$${request.discountAmount})` : ''}`,
          date: new Date(),
        },
      });
    }

    return updated;
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.paymentRequest.delete({ where: { id } });
  }
}
