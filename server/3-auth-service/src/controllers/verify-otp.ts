import { getAuthUserByOTP, signToken, syncAuthRole, updateUserOTP } from '@auth/services/auth.service';
import { BadRequestError, IAuthDocument } from '@19010853/ithust-shared';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { omit } from 'lodash';

export async function updateOTP(req: Request, res: Response): Promise<void> {
  const { otp } = req.params;
  const { browserName, deviceType } = req.body;
  const checkIfUserExist: IAuthDocument | undefined = await getAuthUserByOTP(otp);
  if (!checkIfUserExist) {
    throw new BadRequestError('OTP is invalid.', 'VerifyOTP updateOTP() method error');
  }
  const role = await syncAuthRole(checkIfUserExist.id!, checkIfUserExist.email!);
  (checkIfUserExist as IAuthDocument & { role?: string }).role = role;
  await updateUserOTP(checkIfUserExist.id!, '', new Date(), browserName, deviceType);
  const userJWT = signToken(checkIfUserExist.id!, checkIfUserExist.email!, checkIfUserExist.username!, role);
  const userData = omit(checkIfUserExist, ['password']);
  res.status(StatusCodes.OK).json({ message: 'OTP verified successfully.', user: userData, token: userJWT });
}
