import { FC, ReactElement } from 'react';
import browseImage from 'src/assets/browse.png';
import collaborate from 'src/assets/collaborate.png';
import contact from 'src/assets/contact.png';
import create from 'src/assets/create.png';

const HowItWorks: FC = (): ReactElement => {
  return (
    <section className="container mx-auto items-center bg-white">
      <div className="px-4 py-8 sm:py-16 lg:px-6">
        <div className="mb-8 lg:mb-16">
          <h2 className="mb-4 text-xl lg:text-2xl font-normal text-center tracking-tight text-sky-400">
            <strong className="font-extrabold">ITHust</strong> hoạt động như thế nào?
          </h2>
          <p className="text-gray-500 text-center sm:text-xl dark:text-gray-400">
            Tìm học giả, chuyên gia và freelancer chất lượng cho dự án học thuật hoặc kinh doanh tiếp theo của bạn.
          </p>
        </div>
        <div className="space-y-8 md:grid md:grid-cols-2 md:gap-12 md:space-y-0 lg:grid-cols-4">
          <div className="text-center">
            <div className="my-0 mx-auto bg-primary-100 dark:bg-primary-900 mb-4 flex h-10 w-10 items-center justify-center rounded-full lg:h-12 lg:w-12">
              <img src={create} className="text-primary-600 dark:text-primary-300 h-15 w-15 dark:text-sky-400" alt="" />
            </div>
            <h3 className="mb-2 text-base lg:text-xl font-bold dark:text-sky-400">Tạo tài khoản</h3>
            <p className="text-gray-500 lg:text-base dark:text-gray-400">Tạo tài khoản trên ITHust</p>
          </div>
          <div className="text-center">
            <div className="my-0 mx-auto bg-primary-100 dark:bg-primary-900 mb-4 flex h-10 w-10 items-center justify-center rounded-full lg:h-12 lg:w-12">
              <img src={browseImage} className="text-primary-600 dark:text-primary-300 h-15 w-15" alt="" />
            </div>
            <h3 className="mb-2 text-base lg:text-xl font-bold dark:text-sky-400">Duyệt chuyên gia</h3>
            <p className="text-gray-500 dark:text-gray-400">Duyệt và chọn chuyên gia phù hợp nhất cho công việc của bạn.</p>
          </div>
          <div className="text-center">
            <div className="my-0 mx-auto bg-primary-100 dark:bg-primary-900 mb-4 flex h-10 w-10 items-center justify-center rounded-full lg:h-12 lg:w-12">
              <img src={contact} className="text-primary-600 dark:text-primary-300 h-15 w-15" alt="" />
            </div>
            <h3 className="mb-2 text-base lg:text-xl font-bold dark:text-sky-400">Liên hệ chuyên gia</h3>
            <p className="text-gray-500 dark:text-gray-400">Bạn có thể gửi tin nhắn trực tiếp cho chuyên gia.</p>
          </div>
          <div className="text-center">
            <div className="my-0 mx-auto bg-primary-100 dark:bg-primary-900 mb-4 flex h-10 w-10 items-center justify-center rounded-full lg:h-12 lg:w-12">
              <img src={collaborate} className="text-primary-600 dark:text-primary-300 h-15 w-15" alt="" />
            </div>
            <h3 className="mb-2 text-base lg:text-xl font-bold dark:text-sky-400">Cộng tác</h3>
            <p className="text-gray-500 dark:text-gray-400">Cộng tác với chuyên gia phù hợp cho dự án của bạn.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
