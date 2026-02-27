import { IAuthDocument } from "@19010853/ithust-shared";
import { sequelize } from "@auth/database";
import { DataTypes, ModelDefined, Optional } from "sequelize";

type AuthUserCreationAttributes = Optional<IAuthDocument, 'id' | 'createdAt' | 'passwordResetToken' | 'passwordResetExpires'>;

const AuthModel: ModelDefined<IAuthDocument, AuthUserCreationAttributes> = sequelize.define('auths', {
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    profilePublicId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    country: {
        type: DataTypes.STRING,
        allowNull: false
    },
    profilePicture: {
        type: DataTypes.STRING,
        allowNull: false
    },
    emailVerificationToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    emailVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 0
    },
    browserName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    deviceType: {
        type: DataTypes.STRING,
        allowNull: false
    },
    otp: {
        type: DataTypes.STRING
    },
    otpExpiration: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: new Date()
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: Date.now
    },
    passwordResetToken: { type: DataTypes.STRING, allowNull: true },
    passwordResetExpires: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: new Date()
    }
}, {
    indexes: [
        {
            unique: true,
            fields: ['email']
        },
        {
            unique: true,
            fields: ['username']
        },
        {
            unique: true,
            fields: ['emailVerificationToken']
        },
    ]
}) as ModelDefined<IAuthDocument, AuthUserCreationAttributes>;