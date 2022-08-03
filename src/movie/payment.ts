import { Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { JsonResponse } from 'src/helpers';
import { Stripe } from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2020-08-27',
});

@Controller('api')
export class PaymentController {
  @Post('payment')
  async payment(@Req() req: Request, @Res() res: Response) {
    // try {
    //   const { currency, email, amount } = req.body;
    //   const customer = await stripe.customers.list({
    //     email,
    //   });
    //   console.log(customer);
    //   if (customer.data.length > 0) {
    //     const cusId = customer.data[0].id;
    //     const charge = await stripe.charges.create({
    //       customer: cusId,
    //       currency,
    //       amount,
    //     });
    //     if (charge.status === 'succeeded') {
    //       return res.status(200).json(JsonResponse(false, 'done'));
    //     }
    //     return res.status(500).json(JsonResponse(false, 'pay fail'));
    //   }
    //   return res.status(404).json(JsonResponse(false, 'not found'));
    // stripe.customers
    //   .create({
    //     name,
    //     email,
    //     source,
    //   })
    //   .then((customer) => {
    //     stripe.charges.create({
    //       amount,
    //       currency: 'usd',
    //       customer: customer.id,
    //     });
    //   })
    //   .then(() => {
    //     return res.status(200).json(JsonResponse(false, 'done'));
    //   })
    //   .catch((e) => {
    //     return res.status(500).json(JsonResponse(true, e.message));
    //   });
    // } catch (error) {
    //   return res.status(500).json(JsonResponse(true, error.message));
    // }
  }
}
