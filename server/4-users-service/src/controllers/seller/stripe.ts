import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError } from '@19010853/ithust-shared';
import { constructConnectWebhookEvent } from '@users/services/stripe-connect.service';
import { createOrGetStripeAccount, createStripeAccountLink, refreshStripeAccountStatus } from '@users/services/stripe-seller.service';
import { handleStripeConnectWebhookEvent } from '@users/services/withdrawal.service';

type RawBodyRequest = Request & {
  rawBody?: Buffer;
};

export const connectAccount = async (req: Request, res: Response): Promise<void> => {
  const seller = await createOrGetStripeAccount(req.params.sellerId);
  res.status(StatusCodes.OK).json({ message: 'Stripe connected account is ready.', seller });
};

export const accountLink = async (req: Request, res: Response): Promise<void> => {
  const result = await createStripeAccountLink(req.params.sellerId);
  res.status(StatusCodes.OK).json({ message: 'Stripe onboarding link created.', ...result });
};

export const status = async (req: Request, res: Response): Promise<void> => {
  const seller = await refreshStripeAccountStatus(req.params.sellerId);
  res.status(StatusCodes.OK).json({ message: 'Stripe connected account status.', seller });
};

export const connectWebhook = async (req: Request, res: Response): Promise<void> => {
  const signature = `${req.headers['stripe-signature'] || ''}`;
  const rawBody = (req as RawBodyRequest).rawBody;
  if (!signature || !rawBody) {
    throw new BadRequestError('Stripe webhook signature or raw body is missing.', 'connectWebhook()');
  }

  const event = constructConnectWebhookEvent(rawBody, signature);
  await handleStripeConnectWebhookEvent(event);
  res.status(StatusCodes.OK).json({ success: true });
};
