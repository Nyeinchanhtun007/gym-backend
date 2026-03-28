import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { MembershipsModule } from './memberships/memberships.module';
import { ClassesModule } from './classes/classes.module';
import { BookingsModule } from './bookings/bookings.module';
import { AuthModule } from './auth/auth.module';
import { MembershipPlansModule } from './membership-plans/membership-plans.module';
import { AccountingModule } from './accounting/accounting.module';
import { DiscountsModule } from './discounts/discounts.module';
import { PaymentRequestsModule } from './payment-requests/payment-requests.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    MembershipsModule,
    ClassesModule,
    BookingsModule,
    AuthModule,
    MembershipPlansModule,
    AccountingModule,
    DiscountsModule,
    PaymentRequestsModule,
    ProductsModule,
    OrdersModule,

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
