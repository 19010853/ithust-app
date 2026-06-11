import { getUserByUsername, signToken, syncAuthRole } from '@auth/services/auth.service';
import { BadRequestError } from '@19010853/ithust-shared';
import { IAuthDocument } from '@19010853/ithust-shared';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export async function token(req: Request, res: Response): Promise<void> {
  const existingUser: IAuthDocument | undefined = await getUserByUsername(req.params.username);
  if ((existingUser as IAuthDocument & { accountStatus?: string }).accountStatus === 'ACCOUNT_LOCKED') {
    throw new BadRequestError('Account is locked. Please contact support.', 'Refresh token account locked error');
  }
  const role = await syncAuthRole(existingUser!.id!, existingUser!.email!);
  (existingUser as IAuthDocument & { role?: string }).role = role;
  const userJWT: string = signToken(existingUser!.id!, existingUser!.email!, existingUser!.username!, role);
  res.status(StatusCodes.OK).json({ message: 'Refresh token', user: existingUser, token: userJWT });
}
