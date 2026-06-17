import { array, boolean, object, ObjectSchema, string } from 'yup';

import { IEducation, IExperience, ILanguage, IPersonalInfoData } from '../interfaces/seller.interface';

const personalInfoSchema: ObjectSchema<IPersonalInfoData> = object({
  fullName: string().required({ fullName: 'Họ và tên là bắt buộc' }),
  profilePicture: string().required({ profilePicture: 'Ảnh đại diện là bắt buộc' }),
  description: string().required({ description: 'Mô tả là bắt buộc' }),
  responseTime: string().required({ responseTime: 'Thời gian phản hồi là bắt buộc' }),
  oneliner: string().required({ oneliner: 'Mô tả ngắn là bắt buộc' })
});

const experienceSchema: ObjectSchema<IExperience> = object({
  _id: string().optional(),
  title: string().required({ title: 'Chức danh là bắt buộc' }),
  company: string().required({ company: 'Công ty là bắt buộc' }),
  startDate: string()
    .notOneOf(['Năm bắt đầu'], { startDate: 'Vui lòng chọn năm bắt đầu' })
    .required({ startDate: 'Năm bắt đầu là bắt buộc' }),
  endDate: string().notOneOf(['Năm kết thúc'], { endDate: 'Vui lòng chọn năm kết thúc' }).required({ endDate: 'Năm kết thúc là bắt buộc' }),
  description: string().required({ description: 'Mô tả là bắt buộc' }),
  currentlyWorkingHere: boolean().optional()
});

const educationSchema: ObjectSchema<IEducation> = object({
  _id: string().optional(),
  country: string().notOneOf(['Quốc gia'], { country: 'Vui lòng chọn quốc gia' }).required({ country: 'Quốc gia là bắt buộc' }),
  university: string().required({ university: 'Tên trường là bắt buộc' }),
  title: string().notOneOf(['Bằng cấp'], { title: 'Vui lòng chọn bằng cấp' }).required({ title: 'Bằng cấp là bắt buộc' }),
  major: string().required({ major: 'Chuyên ngành là bắt buộc' }),
  year: string().notOneOf(['Năm'], { year: 'Vui lòng chọn năm' }).required({ year: 'Năm là bắt buộc' })
});

const languagesSchema: ObjectSchema<ILanguage> = object({
  _id: string().optional(),
  language: string().required({ language: 'Ngôn ngữ là bắt buộc' }),
  level: string().notOneOf(['Trình độ'], { level: 'Vui lòng chọn trình độ' }).required({ level: 'Trình độ là bắt buộc' })
});

const skillSchema = string().required('Vui lòng thêm ít nhất 1 kỹ năng');

const ArrayOfExperienceSchema = array().of(experienceSchema);
const ArrayOfEducationSchema = array().of(educationSchema);
const ArrayOfSkillsSchema = array().of(skillSchema);
const ArrayOfLanguagesSchema = array().of(languagesSchema);

export { ArrayOfEducationSchema, ArrayOfExperienceSchema, ArrayOfLanguagesSchema, ArrayOfSkillsSchema, personalInfoSchema };
