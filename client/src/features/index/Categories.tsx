/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, ReactElement } from 'react';
import { categories } from 'src/shared/utils/static-data';
import { v4 as uuidv4 } from 'uuid';

const categoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    Business: 'Kinh doanh',
    Data: 'Dữ liệu',
    'Digital Marketing': 'Marketing số',
    'Graphics & Design': 'Thiết kế đồ họa',
    'Music & Audio': 'Âm nhạc & âm thanh',
    Photography: 'Nhiếp ảnh',
    'Programming & Tech': 'Lập trình & công nghệ',
    'Video & Animation': 'Video & hoạt hình',
    'Writing & Translation': 'Viết lách & dịch thuật'
  };
  return labels[category] || category;
};

const Categories: FC = (): ReactElement => {
  return (
    <section className="container mx-auto bg-white">
      <div className="mx-auto px-4 py-8 text-center lg:px-6 lg:py-10">
        <div className="mx-auto mb-2 lg:mb-16">
          <h2 className="mb-4 text-left sm:text-center text-xl lg:text-2xl font-normal tracking-tight text-sky-400">
            Khám phá danh mục <strong className="font-extrabold">Freelance</strong>
          </h2>
        </div>
        <div className="gap-8 hidden sm:grid sm:grid-cols-3 md:grid-cols-4">
          {categories.map((category: any) => (
            <div key={uuidv4()} className="w-full py-5 cursor-pointer">
              <img className="mx-auto hidden mb-4 sm:w-8 sm:h-8 md:h-12 md:w-12 sm:flex" src={category.icon} alt={category.name} />
              <h3 className="mb-1 text-base hover:text-sky-400">
                <a className="w-full">{categoryLabel(category.name)}</a>
              </h3>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-x-2 gap-y-4 py-1 sm:hidden">
          {categories.map((category: any) => (
            <div key={uuidv4()} className="cursor-pointer text-black border border-black rounded-3xl w-auto p-2 hover:bg-[#f7f9fa]">
              <h3 className="mb-1 text-xs font-bold ">{categoryLabel(category.name)}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
