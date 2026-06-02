const mockTransport = { name: 'smtp-transport' };
const mockCreateTransport = jest.fn(() => mockTransport);
const mockGetTestMessageUrl = jest.fn(() => false);
const mockSend = jest.fn(() => Promise.resolve({ messageId: 'message-id' }));
const mockEmailConstructor = jest.fn().mockImplementation(() => ({ send: mockSend }));

jest.mock('nodemailer', () => ({
  __esModule: true,
  default: {
    createTransport: mockCreateTransport,
    getTestMessageUrl: mockGetTestMessageUrl
  }
}));

jest.mock('email-templates', () => ({
  __esModule: true,
  default: mockEmailConstructor
}));

jest.mock('@19010853/ithust-shared', () => ({
  winstonLogger: jest.fn(() => ({
    info: jest.fn(),
    log: jest.fn()
  }))
}));

describe('emailTemplates helper', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  async function sendEmailWithEnv(env: NodeJS.ProcessEnv): Promise<void> {
    process.env = {
      ...originalEnv,
      ...env
    };

    const { emailTemplates } = await import('@notifications/helpers');
    await emailTemplates('verifyEmail', 'student@example.com', {} as never);
  }

  it('uses Brevo SMTP env settings in production', async () => {
    await sendEmailWithEnv({
      NODE_ENV: 'production',
      SMTP_HOST: 'smtp-relay.brevo.com',
      SMTP_PORT: '587',
      SMTP_SECURE: 'false',
      SMTP_USERNAME: 'brevo-login@example.com',
      SMTP_PASSWORD: 'brevo-smtp-key',
      SENDER_NAME: 'ITHust App',
      SENDER_EMAIL: 'no-reply@ithust.shop',
      SENDER_EMAIL_PASSWORD: 'legacy-password'
    });

    expect(mockCreateTransport).toHaveBeenCalledWith({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: 'brevo-login@example.com',
        pass: 'brevo-smtp-key'
      }
    });
    expect(mockEmailConstructor).toHaveBeenCalledWith(
      expect.objectContaining({
        message: {
          from: 'ITHust App <no-reply@ithust.shop>'
        },
        transport: mockTransport
      })
    );
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        message: { to: 'student@example.com' },
        locals: {}
      })
    );
  });

  it('uses Ethereal SMTP host in development even if Brevo host is present', async () => {
    await sendEmailWithEnv({
      NODE_ENV: 'development',
      SMTP_HOST: 'smtp-relay.brevo.com',
      SMTP_PORT: '587',
      SMTP_SECURE: 'false',
      SMTP_USERNAME: 'ethereal-user@example.com',
      SMTP_PASSWORD: 'ethereal-password',
      SENDER_NAME: 'ITHust App',
      SENDER_EMAIL: 'ethereal-user@example.com',
      SENDER_EMAIL_PASSWORD: 'legacy-password'
    });

    expect(mockCreateTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        host: 'smtp.ethereal.email',
        auth: {
          user: 'ethereal-user@example.com',
          pass: 'ethereal-password'
        }
      })
    );
  });

  it('falls back to SMTP_USERNAME as sender when local sender email is still the template placeholder', async () => {
    await sendEmailWithEnv({
      NODE_ENV: 'development',
      SMTP_PORT: '587',
      SMTP_SECURE: 'false',
      SMTP_USERNAME: 'ethereal-user@example.com',
      SMTP_PASSWORD: 'ethereal-password',
      SENDER_NAME: 'ITHust App',
      SENDER_EMAIL: 'REPLACE_WITH_ETHEREAL_SMTP_USER',
      SENDER_EMAIL_PASSWORD: 'legacy-password'
    });

    expect(mockEmailConstructor).toHaveBeenCalledWith(
      expect.objectContaining({
        message: {
          from: 'ITHust App <ethereal-user@example.com>'
        },
        transport: mockTransport
      })
    );
  });

  it('uses Ethereal SMTP host in test even if Brevo host is present', async () => {
    await sendEmailWithEnv({
      NODE_ENV: 'test',
      SMTP_HOST: 'smtp-relay.brevo.com',
      SMTP_PORT: '587',
      SMTP_SECURE: 'false',
      SMTP_USERNAME: 'ethereal-test-user@example.com',
      SMTP_PASSWORD: 'ethereal-test-password',
      SENDER_NAME: 'ITHust App',
      SENDER_EMAIL: 'ethereal-test-user@example.com',
      SENDER_EMAIL_PASSWORD: 'legacy-password'
    });

    expect(mockCreateTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        host: 'smtp.ethereal.email',
        auth: {
          user: 'ethereal-test-user@example.com',
          pass: 'ethereal-test-password'
        }
      })
    );
  });
});
