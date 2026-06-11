import { Request, Response } from 'express';
import { AuthModel } from '@auth/models/auth.schema';
import { read } from '@auth/controllers/signin';
import { authMock, authMockRequest, authMockResponse } from '@auth/controllers/test/mocks/auth.mock';
import * as auth from '@auth/services/auth.service';
import * as producer from '@auth/queues/auth.producer';
import { IAuthDocument } from '@19010853/ithust-shared';

jest.mock('@auth/models/auth.schema', () => ({
  AuthModel: {
    prototype: {
      comparePassword: jest.fn()
    }
  }
}));
jest.mock('@auth/services/auth.service');
jest.mock('@auth/queues/auth.producer');
jest.mock('@auth/server', () => ({
  authChannel: {}
}));
jest.mock('@elastic/elasticsearch');

const PASSWORD = 'manny1';
const EMAIL = 'manny@test.com';

const loginBody = {
  email: EMAIL,
  password: PASSWORD,
  browserName: 'Chrome',
  deviceType: 'browser'
};

const newDeviceLoginBody = {
  ...loginBody,
  browserName: 'Firefox'
};

const activeUser = {
  ...authMock,
  password: 'hashedPassword',
  browserName: 'Chrome',
  deviceType: 'browser',
  accountStatus: 'ACTIVE'
} as IAuthDocument & { accountStatus: string };

describe('SignIn', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should reject username login with invalid email validation error', async () => {
    const req: Request = authMockRequest({}, { email: 'Manny', password: PASSWORD }, null) as unknown as Request;
    const res: Response = authMockResponse();

    await expect(read(req, res)).rejects.toThrow('Invalid email');
    expect(auth.getUserByEmail).not.toHaveBeenCalled();
  });

  it('should return invalid credentials when email does not exist', async () => {
    const req: Request = authMockRequest({}, loginBody, null) as unknown as Request;
    const res: Response = authMockResponse();
    jest.spyOn(auth, 'getUserByEmail').mockResolvedValue(undefined);

    await expect(read(req, res)).rejects.toThrow('Invalid credentials');
    expect(auth.getUserByEmail).toHaveBeenCalledWith(EMAIL);
  });

  it('should reject locked accounts', async () => {
    const req: Request = authMockRequest({}, loginBody, null) as unknown as Request;
    const res: Response = authMockResponse();
    const lockedUser = {
      ...activeUser,
      accountStatus: 'ACCOUNT_LOCKED'
    } as IAuthDocument;
    jest.spyOn(auth, 'getUserByEmail').mockResolvedValue(lockedUser);

    await expect(read(req, res)).rejects.toThrow('Account is locked. Please contact support.');
  });

  it('should sign in with a valid email and password', async () => {
    const req: Request = authMockRequest({}, loginBody, null) as unknown as Request;
    const res: Response = authMockResponse();
    jest.spyOn(auth, 'getUserByEmail').mockResolvedValue(activeUser);
    jest.spyOn(AuthModel.prototype, 'comparePassword').mockResolvedValue(true);
    jest.spyOn(auth, 'syncAuthRole').mockResolvedValue('user');
    jest.spyOn(auth, 'signToken').mockReturnValue('jwt-token');

    await read(req, res);

    expect(auth.getUserByEmail).toHaveBeenCalledWith(EMAIL);
    expect(AuthModel.prototype.comparePassword).toHaveBeenCalledWith(PASSWORD, 'hashedPassword');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'User login successfully',
      user: expect.objectContaining({
        email: EMAIL,
        username: 'Manny'
      }),
      token: 'jwt-token',
      browserName: '',
      deviceType: ''
    });
  });

  it('should send OTP for a valid email on a new device', async () => {
    const req: Request = authMockRequest({}, newDeviceLoginBody, null) as unknown as Request;
    const res: Response = authMockResponse();
    jest.spyOn(auth, 'getUserByEmail').mockResolvedValue(activeUser);
    jest.spyOn(AuthModel.prototype, 'comparePassword').mockResolvedValue(true);
    jest.spyOn(auth, 'syncAuthRole').mockResolvedValue('user');

    await read(req, res);

    expect(producer.publishDirectMessage).toHaveBeenCalled();
    expect(auth.updateUserOTP).toHaveBeenCalledWith(activeUser.id, expect.any(String), expect.any(Date), '', '');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'OTP code sent',
      user: null,
      token: '',
      browserName: 'Chrome',
      deviceType: 'browser'
    });
  });
});
