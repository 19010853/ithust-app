import { getUserByUsername, signToken, syncAuthRole } from '@auth/services/auth.service';
import { IAuthDocument } from '@19010853/ithust-shared';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export async function token(req: Request, res: Response): Promise<void> {
  const existingUser: IAuthDocument | undefined = await getUserByUsername(req.params.username);
  const role = await syncAuthRole(existingUser!.id!, existingUser!.email!);
  (existingUser as IAuthDocument & { role?: string }).role = role;
  const userJWT: string = signToken(existingUser!.id!, existingUser!.email!, existingUser!.username!, role);
  res.status(StatusCodes.OK).json({ message: 'Refresh token', user: existingUser, token: userJWT });
}
