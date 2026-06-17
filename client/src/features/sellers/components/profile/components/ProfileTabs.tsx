import { FC, ReactElement } from 'react';
import { IProfileTabsProps } from 'src/features/sellers/interfaces/seller.interface';
import Dropdown from 'src/shared/dropdown/Dropdown';

const ProfileTabs: FC<IProfileTabsProps> = ({ type, setType }): ReactElement => {
  const tabs = [
    { value: 'Overview', label: 'Tổng quan' },
    { value: 'Active Gigs', label: 'Gig đang hoạt động' },
    { value: 'Ratings & Reviews', label: 'Đánh giá & nhận xét' }
  ];
  const currentLabel = tabs.find((tab) => tab.value === type)?.label || type;
  const handleSelect = (label: string): void => {
    const selectedTab = tabs.find((tab) => tab.label === label);
    if (setType && selectedTab) {
      setType(selectedTab.value);
    }
  };

  return (
    <>
      <div className="sm:hidden bg-white border-grey">
        <Dropdown text={currentLabel} maxHeight="300" values={tabs.map((tab) => tab.label)} onClick={handleSelect} />
      </div>
      <ul className="hidden divide-x divide-gray-200 text-center text-sm font-medium text-gray-500 shadow dark:text-gray-400 sm:flex">
        <li className="w-full">
          <div
            onClick={() => {
              if (setType) {
                setType('Overview');
              }
            }}
            className={`inline-block w-full p-4 text-gray-600 hover:text-gray-700 focus:outline-none
              ${type === 'Overview' ? 'bg-sky-200' : 'bg-white'}
            `}
          >
            Tổng quan
          </div>
        </li>
        <li className="w-full">
          <div
            onClick={() => {
              if (setType) {
                setType('Active Gigs');
              }
            }}
            className={`inline-block w-full p-4 text-gray-600 hover:text-gray-700 focus:outline-none
              ${type === 'Active Gigs' ? 'bg-sky-200' : 'bg-white'}
            `}
          >
            Gig đang hoạt động
          </div>
        </li>
        <li className="w-full">
          <div
            onClick={() => {
              if (setType) {
                setType('Ratings & Reviews');
              }
            }}
            className={`inline-block w-full p-4 text-gray-600 hover:text-gray-700 focus:outline-none
              ${type === 'Ratings & Reviews' ? 'bg-sky-200' : 'bg-white'}
            `}
          >
            Đánh giá & nhận xét
          </div>
        </li>
      </ul>
    </>
  );
};

export default ProfileTabs;
