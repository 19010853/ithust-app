import crypto from 'crypto';

import { createAuthUser, getUserByUsernameOrEmail } from '@auth/services/auth.service';
import { faker } from '@faker-js/faker';
import { BadRequestError, IAuthDocument, firstLetterToUppercase, lowerCase } from '@19010853/ithust-shared';
import { Request, Response } from 'express';
import { generateUsername } from 'unique-username-generator';
import { v4 as uuidV4 } from 'uuid';
import { sample } from 'lodash';
import { StatusCodes } from 'http-status-codes';

const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera'];
const devices = ['Desktop', 'Mobile', 'Tablet'];

export async function create(req: Request, res: Response): Promise<void> {
    const { count } = req.params;
    const usernames: string[] = [];
    for (let i = 0; i < parseInt(count, 10); i++) {
        const username: string = generateUsername('', 0, 12);
        usernames.push(firstLetterToUppercase(username));
    }

    for (let i = 0; i < usernames.length; i++) {
        const username = usernames[i];
        const email = faker.internet.email();
        const password = 'qwerty';
        const country = faker.location.country();
        const profilePicture = faker.image.urlPicsumPhotos();
        const checkIfUserExist: IAuthDocument | undefined = await getUserByUsernameOrEmail(username, email);
        if (checkIfUserExist) {
            throw new BadRequestError('Invalid credentials. Email or Username', 'Seed create() method error');
        }
        const profilePublicId = uuidV4();
        const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
        const randomCharacters: string = randomBytes.toString('hex');
        const authData: IAuthDocument = {
            username: firstLetterToUppercase(username),
            email: lowerCase(email),
            profilePublicId,
            password,
            country,
            profilePicture,
            emailVerificationToken: randomCharacters,
            emailVerified: sample([0, 1]),
            // Dùng hàm sample để chọn ngẫu nhiên 1 giá trị trong mảng
            browserName: sample(browsers) as string, 
            deviceType: sample(devices) as string
        } as IAuthDocument;
        await createAuthUser(authData);
    }
    res.status(StatusCodes.OK).json({ message: 'Seed users created successfully.' });
}