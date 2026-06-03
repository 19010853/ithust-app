import { adminService } from '@gateway/services/api/admin.service';
import { AxiosResponse } from 'axios';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export class AdminUsers {
  public async users(req: Request, res: Response): Promise<void> {
    const response: AxiosResponse = await adminService.getUsers(req.query);
    res.status(StatusCodes.OK).json({
      message: response.data.message,
      users: response.data.users,
      pagination: response.data.pagination,
      filters: response.data.filters
    });
  }

  public async userDetail(req: Request, res: Response): Promise<void> {
    const response: AxiosResponse = await adminService.getUserDetail(req.params.username);
    res.status(StatusCodes.OK).json({ message: response.data.message, adminUser: response.data.adminUser });
  }
}
