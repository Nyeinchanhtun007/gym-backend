import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from '../products/products.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private productsService: ProductsService,
  ) {}

  async create(userId: number, items: { productId: number; quantity: number }[]) {
    // 1. Validate stocks and calculate total
    let totalAmount = 0;
    const orderItemsData: any[] = [];

    for (const item of items) {
      const product = await this.productsService.findOne(item.productId);
      if (product.stock < item.quantity) {
        throw new BadRequestException(`Not enough stock for product: ${product.name}`);
      }
      totalAmount += product.price * item.quantity;
      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
      });
    }

    // 2. Create order in a transaction
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId,
          totalAmount,
          items: {
            create: orderItemsData,
          },
        },
        include: { items: true },
      });

      // 3. Update stocks
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return order;
    });
  }

  async findAll() {
    return this.prisma.order.findMany({
      include: {
        items: { include: { product: true } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByUser(userId: number) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: number, status: string) {
    return this.prisma.order.update({
      where: { id },
      data: { status },
    });
  }
}
