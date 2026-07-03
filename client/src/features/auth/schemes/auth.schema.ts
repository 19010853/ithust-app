import { object, ObjectSchema, string } from 'yup';

import { IResetPassword, ISignInPayload, ISignUpPayload } from '../interfaces/auth.interface';

const loginUserSchema: ObjectSchema<ISignInPayload> = object({
  email: string().trim().email({ email: 'Email không hợp lệ' }).required({ email: 'Vui lòng nhập email' }),
  password: string().required({ password: 'Vui lòng nhập mật khẩu' }).min(4, { password: 'Mật khẩu phải có ít nhất 4 ký tự' }),
  browserName: string().optional().nullable().notRequired(),
  deviceType: string().optional().nullable().notRequired()
});

const registerUserSchema: ObjectSchema<ISignUpPayload> = object({
  username: string().required({ username: 'Vui lòng nhập tên người dùng' }).min(4, { username: 'Tên người dùng phải có ít nhất 4 ký tự' }),
  password: string().required({ password: 'Vui lòng nhập mật khẩu' }).min(4, { password: 'Mật khẩu phải có ít nhất 4 ký tự' }),
  email: string().trim().email({ email: 'Email không hợp lệ' }).required({ email: 'Vui lòng nhập email' }),
  country: string().notOneOf(['Chọn quốc gia'], { country: 'Vui lòng chọn quốc gia' }).required({ country: 'Vui lòng chọn quốc gia' }),
  profilePicture: string().required({ profilePicture: 'Vui lòng tải ảnh đại diện' }),
  browserName: string().optional().nullable().notRequired(),
  deviceType: string().optional().nullable().notRequired()
});

const resetPasswordSchema: ObjectSchema<IResetPassword> = object({
  password: string().required({ password: 'Vui lòng nhập mật khẩu' }).min(4, { password: 'Mật khẩu phải có ít nhất 4 ký tự' }),
  confirmPassword: string()
    .required({ confirmPassword: 'Vui lòng xác nhận mật khẩu' })
    .min(4, { password: 'Mật khẩu phải có ít nhất 4 ký tự' })
});

export { loginUserSchema, registerUserSchema, resetPasswordSchema };
