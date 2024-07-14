import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { Public } from 'src/custom-decorators/is-public-decorator';
import { ResponseMessage } from 'src/custom-decorators/response-message-decorator';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) { }

  @Public()
  @ResponseMessage('Create a payment')
  @Post('create')
  createOrder(@Body() body) {
    return this.paymentService.createPaymentLink(body);
  }

  @Get(':orderId')
  @ResponseMessage('get a order')
  getOrder(@Param('orderId') orderId: string) {
    return this.paymentService.getPaymentLinkInformation(orderId);
  }

  @Put(':orderId')
  @ResponseMessage('Cancel a order')
  cancelOrder(@Param('orderId') orderId: string, @Body('cancellationReason') cancellationReason: string) {
    return this.paymentService.cancelPaymentLink(orderId, cancellationReason);
  }

  @Post('confirm-webhook')
  @ResponseMessage('Confirm webhook')
  confirmWebhook(@Body('webhookUrl') webhookUrl: string) {
    return this.paymentService.confirmWebhook(webhookUrl);
  }
}
