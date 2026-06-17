import { ChangeEvent, FC, ReactElement, useState } from 'react';
import { FaChevronDown, FaChevronUp, FaTimes } from 'react-icons/fa';
import { useSearchParams } from 'react-router-dom';
import Button from 'src/shared/button/Button';
import TextInput from 'src/shared/inputs/TextInput';
import { saveToLocalStorage } from 'src/shared/utils/utils.service';
import { v4 as uuidv4 } from 'uuid';

const deliveryTime = [
  { label: 'Tối đa 1 ngày', value: '1' },
  { label: 'Tối đa 2 ngày', value: '2' },
  { label: 'Tối đa 3 ngày', value: '3' },
  { label: 'Tối đa 4 ngày', value: '4' },
  { label: 'Tối đa 5 ngày', value: '5' },
  { label: 'Tối đa 6 ngày', value: '6' },
  { label: 'Tối đa 7 ngày', value: '7' },
  { label: 'Bất kỳ lúc nào', value: 'Anytime' }
];

const DeliveryTimeDropdown: FC = (): ReactElement => {
  const [searchParams, setSearchParams] = useSearchParams({});
  const [toggleDropdown, setToggleDropdown] = useState<boolean>(false);
  const [selectedTime, setSelectedTime] = useState<string>('Anytime');

  return (
    <div className="flex flex-col">
      <div className="relative">
        <Button
          className="flex justify-between gap-5 rounded-lg border border-gray-400 px-5 py-3 font-medium"
          label={
            <>
              <span className="truncate">Thời gian giao</span>
              {!toggleDropdown ? (
                <FaChevronDown className="float-right mt-§ h-4 fill-current text-slate-900" />
              ) : (
                <FaChevronUp className="float-right mt-§ h-4 fill-current text-slate-900" />
              )}
            </>
          }
          onClick={() => setToggleDropdown((item: boolean) => !item)}
        />
        {toggleDropdown && (
          <div className="absolute z-50 mt-2 w-96 divide-y divide-gray-100 rounded-lg border border-slate-100 bg-white drop-shadow-md sm:w-72">
            <ul className="space-y-1 p-3 text-sm text-gray-700 dark:text-gray-200">
              {deliveryTime.map((time) => (
                <li key={uuidv4()} className="cursor-pointer" onClick={() => setSelectedTime(time.value)}>
                  <div className="flex rounded p-2">
                    <div className="flex h-5 items-center">
                      <TextInput
                        checked={time.value === selectedTime}
                        id="selectedTime"
                        name="selectedTime"
                        type="radio"
                        value={selectedTime}
                        className="dark:focus:ring-blue-sky-500 h-4 w-4 bg-gray-100 text-blue-600 dark:border-gray-500 dark:bg-gray-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700"
                        onChange={(event: ChangeEvent) => {
                          setSelectedTime((event.target as HTMLInputElement).value);
                        }}
                      />
                    </div>
                    <div className="ml-2 text-sm ">
                      <label htmlFor="helper-radio-4" className="font-medium text-slate-950">
                        <div>{time.label}</div>
                      </label>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="my-4 flex cursor-pointer justify-evenly pt-3">
              <div
                className="px-4 py-2 text-sm font-medium text-slate-900"
                onClick={() => {
                  setSelectedTime('Anytime');
                  setToggleDropdown(false);
                }}
              >
                Xóa tất cả
              </div>
              <div
                className="rounded bg-sky-500 px-4 py-2 text-sm font-bold text-white hover:bg-sky-400"
                onClick={() => {
                  const updatedSearchParams: URLSearchParams = new URLSearchParams(searchParams.toString());
                  updatedSearchParams.set('delivery_time', selectedTime);
                  setSearchParams(updatedSearchParams);
                  setToggleDropdown(false);
                  saveToLocalStorage('filterApplied', JSON.stringify(true));
                }}
              >
                Áp dụng
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="mt-2 flex h-10 gap-4 text-xs text-slate-950">
        {selectedTime !== 'Anytime' && (
          <Button
            className="flex gap-4 self-center rounded-full bg-gray-200 px-5 py-1 font-bold hover:text-gray-500"
            label={
              <>
                {`Tối đa ${selectedTime} ngày`}
                <FaTimes className="self-center font-normal" />
              </>
            }
            onClick={() => {
              const updatedSearchParams: URLSearchParams = new URLSearchParams(searchParams.toString());
              updatedSearchParams.delete('delivery_time');
              setSearchParams(updatedSearchParams);
              setToggleDropdown(false);
              setSelectedTime('Anytime');
            }}
          />
        )}
      </div>
    </div>
  );
};

export default DeliveryTimeDropdown;
