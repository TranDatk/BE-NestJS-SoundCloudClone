import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import PayOS from '@payos/node';
import crypto from 'crypto';

@Injectable()
export class PaymentService {
    constructor(
        @Inject('PAYOS') private readonly payOS: PayOS,
        private configService: ConfigService
    ) { }

    createPaymentSignature(amount: string, cancelUrl: string, description: string, orderCode: string, returnUrl: string): string {
        const data = `amount=${amount}&cancelUrl=${cancelUrl}&description=${description}&orderCode=${orderCode}&returnUrl=${returnUrl}`;
        return createSignature(data, this.configService.get<string>('PAYOS_CHECKSUM_KEY'));
    }

    async createPaymentLink(body) {
        const orderCode = Number(String(new Date().getTime()).slice(-6));

        const signature = this.createPaymentSignature(
            body?.amount,
            body.cancelUrl,
            body?.description,
            (orderCode).toString(),
            body?.returnUrl
        );

        const orderBody = {
            orderCode: orderCode,
            amount: body?.amount,
            description: body?.description,
            cancelUrl: body?.cancelUrl,
            returnUrl: body?.returnUrl,
            signature: signature
        };

        try {
            const paymentLinkRes = await this.payOS.createPaymentLink(orderBody);
            return {
                infor: {
                    bin: paymentLinkRes?.bin,
                    checkoutUrl: paymentLinkRes?.checkoutUrl,
                    accountNumber: paymentLinkRes?.accountNumber,
                    accountName: paymentLinkRes?.accountName,
                    amount: paymentLinkRes?.amount,
                    description: paymentLinkRes?.description,
                    orderCode: paymentLinkRes?.orderCode,
                    qrCode: paymentLinkRes?.qrCode,
                },
                signature: signature
            };
        } catch (error) {
            throw new BadRequestException(error?.message)
        }
    }

    async getPaymentLinkInformation(orderId) {
        try {
            const order = await this.payOS.getPaymentLinkInformation(orderId);
            if (!order) {
                throw new NotFoundException('Not found');
            }
            return { order: order };
        } catch (error) {
            throw new BadRequestException(error?.message);
        }
    }

    cancelPaymentLink(orderId, cancellationReason) {
        try {
            const order = this.payOS.cancelPaymentLink(orderId, cancellationReason);
            if (!order) {
                throw new NotFoundException('Not found');
            }
            return { order: order };
        } catch (error) {
            throw new BadRequestException(error?.message);
        }
    }

    confirmWebhook(webhookUrl) {
        try {
            this.payOS.confirmWebhook(webhookUrl);
            return null;
        } catch (error) {
            throw new BadRequestException(error?.message);
        }
    }
}

function createSignature(data: string, secretKey: string): string {
    return crypto.createHmac('sha256', secretKey).update(data).digest('hex');
}
