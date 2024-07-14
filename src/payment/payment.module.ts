import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { ConfigModule } from '@nestjs/config';
import { PayOSProvider } from './payos.provider';

@Module({
  imports: [
    ConfigModule
  ],
  controllers: [PaymentController],
  providers: [PaymentService, PayOSProvider,],
  exports: [PaymentService]
})
export class PaymentModule { }
