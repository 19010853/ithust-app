import { config } from '@auth/config';
import { AuthModel } from '@auth/models/auth.schema';
import { IAuthDocument, firstLetterToUppercase, lowerCase, winstonLogger } from '@19010853/ithust-shared';
import { Model } from 'sequelize';
import { v4 as uuidV4 } from 'uuid';
import { Logger } from 'winston';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'platformAdminService', 'debug');

const ensurePlatformAdmin = async (): Promise<void> => {
  const ownerEmail = lowerCase(`${config.PLATFORM_OWNER_EMAIL || ''}`.trim());
  const ownerUsername = firstLetterToUppercase(`${config.PLATFORM_OWNER_USERNAME || ''}`.trim());
  const ownerPassword = `${config.PLATFORM_OWNER_PASSWORD || ''}`;

  if (!ownerEmail || !ownerUsername || !ownerPassword) {
    log.warn('Platform admin seed skipped. PLATFORM_OWNER_EMAIL, PLATFORM_OWNER_USERNAME and PLATFORM_OWNER_PASSWORD are required.');
    return;
  }

  try {
    await AuthModel.sync({ alter: true });
    const userByEmail = (await AuthModel.findOne({ where: { email: ownerEmail } })) as Model | null;
    const userByUsername = (await AuthModel.findOne({ where: { username: ownerUsername } })) as Model | null;

    if (userByEmail && userByUsername && userByEmail.dataValues.id !== userByUsername.dataValues.id) {
      log.error('Platform admin seed skipped. PLATFORM_OWNER_EMAIL and PLATFORM_OWNER_USERNAME belong to different users.');
      return;
    }

    const existingAdmin = userByEmail || userByUsername;
    if (existingAdmin) {
      await AuthModel.update(
        {
          username: ownerUsername,
          email: ownerEmail,
          role: 'admin',
          emailVerified: 1
        },
        { where: { id: existingAdmin.dataValues.id } }
      );
      log.info('Platform admin account is ready.');
      return;
    }

    await AuthModel.create({
      username: ownerUsername,
      email: ownerEmail,
      password: ownerPassword,
      role: 'admin',
      profilePublicId: uuidV4(),
      country: 'Vietnam',
      profilePicture: 'https://placehold.co/330x220?text=Admin',
      emailVerificationToken: uuidV4(),
      emailVerified: 1,
      browserName: 'System',
      deviceType: 'Desktop'
    } as IAuthDocument & { role: string });
    log.info('Platform admin account created.');
  } catch (error) {
    log.error(error);
  }
};

export { ensurePlatformAdmin };
