/* eslint-disable @typescript-eslint/no-explicit-any */
import { array, number, object, ObjectSchema, string } from 'yup';

import { ICreateGig } from '../interfaces/gig.interface';

const gigInfoSchema: ObjectSchema<ICreateGig | any> = object({
  sellerId: string().optional(),
  profilePicture: string().optional(),
  title: string().max(80, { title: 'Tiêu đề gig tối đa 80 ký tự' }).required({ title: 'Vui lòng nhập tiêu đề gig' }),
  categories: string()
    .notOneOf(['Chọn danh mục'], { categories: 'Vui lòng chọn danh mục' })
    .required({ categories: 'Vui lòng chọn danh mục' }),
  description: string()
    .max(1200, { description: 'Mô tả tối đa 1200 ký tự' })
    .required({ description: 'Vui lòng nhập mô tả' }),
  coverImage: string().required({ coverImage: 'Vui lòng tải ảnh bìa gig' }),
  expectedDelivery: string()
    .notOneOf(['Thời gian giao dự kiến'], { expectedDelivery: 'Vui lòng chọn thời gian giao dự kiến' })
    .required({ expectedDelivery: 'Vui lòng chọn thời gian giao dự kiến' }),
  basicDescription: string()
    .max(100, { basicDescription: 'Mô tả ngắn của gig tối đa 100 ký tự' })
    .required({ basicDescription: 'Vui lòng nhập mô tả ngắn của gig' }),
  basicTitle: string()
    .max(40, { basicTitle: 'Tiêu đề gói cơ bản tối đa 40 ký tự' })
    .required({ basicTitle: 'Vui lòng nhập tiêu đề gói cơ bản' }),
  subCategories: array(string()).min(1, { subCategories: 'Vui lòng thêm danh mục con' }),
  tags: array(string()).min(1, { tags: 'Vui lòng thêm thẻ tìm kiếm' }),
  price: number().min(5, { price: 'Giá phải tối thiểu là 5' }).required({ price: 'Vui lòng nhập giá' })
});

export { gigInfoSchema };
