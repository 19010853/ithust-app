import { BadRequestError } from '@19010853/ithust-shared';
import { addDisputeMessage, createQualityDispute, decideDispute, getDisputeMessages, listDisputes } from '@order/services/dispute.service';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

const actorFrom = (req: Request) => ({
  id: req.currentUser?.id,
  username: `${req.currentUser?.username || ''}`,
  email: req.currentUser?.email,
  role: (req.currentUser as typeof req.currentUser & { role?: string })?.role
});

export const createDispute = async (req: Request, res: Response): Promise<void> => {
  if (!req.body.reason?.trim() || req.body.reason.trim().length < 10) {
    throw new BadRequestError('Dispute reason must contain at least 10 characters.', 'createDispute()');
  }
  const dispute = await createQualityDispute(
    req.params.orderId,
    `${req.currentUser?.username || ''}`,
    req.body.reason.trim(),
    req.body.evidence || []
  );
  res.status(StatusCodes.CREATED).json({ message: 'Quality dispute opened.', dispute });
};

export const disputes = async (req: Request, res: Response): Promise<void> => {
  const result = await listDisputes(actorFrom(req), `${req.query.status || ''}` || undefined);
  res.status(StatusCodes.OK).json({ message: 'Disputes', disputes: result });
};

export const messages = async (req: Request, res: Response): Promise<void> => {
  const result = await getDisputeMessages(req.params.disputeId, actorFrom(req));
  res.status(StatusCodes.OK).json({ message: 'Dispute messages', disputeMessages: result });
};

export const createMessage = async (req: Request, res: Response): Promise<void> => {
  if (!req.body.body?.trim()) throw new BadRequestError('Message body is required.', 'createDisputeMessage()');
  const message = await addDisputeMessage(
    req.params.disputeId,
    actorFrom(req),
    req.body.body.trim(),
    req.body.visibility || 'PARTICIPANTS',
    req.body.attachments || []
  );
  res.status(StatusCodes.CREATED).json({ message: 'Dispute message created.', disputeMessage: message });
};

export const decision = async (req: Request, res: Response): Promise<void> => {
  const allowed = ['REVISION_REQUIRED', 'REFUND_BUYER', 'RELEASE_SELLER'];
  if (!allowed.includes(req.body.decision) || !req.body.reason?.trim()) {
    throw new BadRequestError('A valid decision and reason are required.', 'decideDispute()');
  }
  const dispute = await decideDispute(
    req.params.disputeId,
    actorFrom(req),
    req.body.decision,
    req.body.reason.trim(),
    req.body.revisionDeadlineAt ? new Date(req.body.revisionDeadlineAt) : undefined
  );
  res.status(StatusCodes.OK).json({ message: 'Dispute decided.', dispute });
};
