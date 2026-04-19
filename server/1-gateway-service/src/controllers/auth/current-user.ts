import { GatewayCache } from '@gateway/redis/gateway.cache';
import { socketIO } from '@gateway/server';
import { authService } from '@gateway/services/api/auth.service';
import { IAuthPayload } from '@19010853/ithust-shared';
import { AxiosResponse } from 'axios';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

const gatewayCache: GatewayCache = new GatewayCache();
export class CurrentUser {
  public async read(req: Request, res: Response): Promise<void> {
    const user: IAuthPayload | undefined = req.currentUser;
    res.status(StatusCodes.OK).json({ message: 'Authenticated user', user: user ?? null });
  }

  public async resendEmail(req: Request, res: Response): Promise<void> {
    const response: AxiosResponse = await authService.resendEmail(req.body);
    res.status(StatusCodes.OK).json({ message: response.data.message, user: response.data.user });
  }

  public async getLoggedInUsers(_req: Request, res: Response): Promise<void> {
    const response: string[] = await gatewayCache.getLoggedInUsersFromCache('loggedInUsers');
    socketIO.emit('online', response);
    res.status(StatusCodes.OK).json({ message: 'User is online' });
  }

  public async removeLoggedInUser(req: Request, res: Response): Promise<void> {
    const response: string[] = await gatewayCache.removeLoggedInUserFromCache('loggedInUsers', req.params.username);
    socketIO.emit('online', response);
    res.status(StatusCodes.OK).json({ message: 'User is offline' });
  }
}
