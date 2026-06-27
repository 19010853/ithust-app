import { ChangeEvent, FC, KeyboardEvent, ReactElement, useState } from 'react';
import { IPersonalInfoProps } from 'src/features/sellers/interfaces/seller.interface';
import TextAreaInput from 'src/shared/inputs/TextAreaInput';
import TextInput from 'src/shared/inputs/TextInput';

const PersonalInfo: FC<IPersonalInfoProps> = ({ personalInfo, setPersonalInfo, personalInfoErrors }): ReactElement => {
  const [allowedInfoLength, setAllowedInfoLength] = useState({
    description: '600/600',
    oneliner: '70/70'
  });
  const maxDescriptionCharacters = 600;
  const maxOneLinerCharacters = 70;
  const getErrorMessage = (field: keyof typeof personalInfo): string => {
    const error = personalInfoErrors.find((item) => item[field]);
    return error?.[field] ?? '';
  };

  return (
    <div className="border-b border-grey p-6">
      <div className="mb-6 grid md:grid-cols-5">
        <div className="pb-2 text-base font-medium">
          Họ và tên<sup className="top-[-0.3em] text-base text-red-500">*</sup>
        </div>
        <div className="col-span-4 w-full">
          <TextInput
            className="border-grey mb-1 w-full rounded border p-2.5 text-sm font-normal text-gray-600 focus:outline-none"
            type="text"
            name="fullname"
            value={personalInfo.fullName}
            onChange={(event: ChangeEvent) => {
              setPersonalInfo({ ...personalInfo, fullName: (event.target as HTMLInputElement).value });
            }}
          />
          {getErrorMessage('fullName') && <p className="mt-1 text-xs text-red-500">{getErrorMessage('fullName')}</p>}
        </div>
      </div>
      <div className="grid md:grid-cols-5 mb-6">
        <div className="text-base font-medium pb-2 mt-6 md:mt-0">
          Mô tả ngắn<sup className="text-red-500 text-base top-[-0.3em]">*</sup>
        </div>
        <div className="w-full col-span-4">
          <TextInput
            className="w-full rounded border border-grey p-2.5 mb-1 text-sm font-normal text-gray-600 focus:outline-none"
            type="text"
            name="oneliner"
            value={personalInfo.oneliner}
            placeholder="Ví dụ: Chuyên gia phát triển mobile và web"
            onChange={(event: ChangeEvent) => {
              const onelinerValue: string = (event.target as HTMLInputElement).value;
              setPersonalInfo({ ...personalInfo, oneliner: onelinerValue });
              const counter: number = maxOneLinerCharacters - onelinerValue.length;
              setAllowedInfoLength({ ...allowedInfoLength, oneliner: `${counter}/70` });
            }}
            onKeyDown={(event: KeyboardEvent) => {
              const currentTextLength = (event.target as HTMLInputElement).value.length;
              if (currentTextLength === maxOneLinerCharacters && event.key !== 'Backspace') {
                event.preventDefault();
              }
            }}
          />
          {getErrorMessage('oneliner') && <p className="mt-1 text-xs text-red-500">{getErrorMessage('oneliner')}</p>}
          <span className="flex justify-end text-[#95979d] text-xs">{allowedInfoLength.oneliner} ký tự</span>
        </div>
      </div>
      <div className="grid md:grid-cols-5 mb-6">
        <div className="text-base font-medium pb-2">
          Mô tả<sup className="text-red-500 text-base top-[-0.3em]">*</sup>
        </div>
        <div className="w-full col-span-4">
          <TextAreaInput
            className="w-full rounded border border-grey p-2.5 mb-1 text-sm font-normal text-gray-600 focus:outline-none"
            name="description"
            value={personalInfo.description}
            rows={5}
            onChange={(event: ChangeEvent) => {
              const descriptionValue: string = (event.target as HTMLInputElement).value;
              setPersonalInfo({ ...personalInfo, description: descriptionValue });
              const counter: number = maxDescriptionCharacters - descriptionValue.length;
              setAllowedInfoLength({ ...allowedInfoLength, description: `${counter}/600` });
            }}
            onKeyDown={(event: KeyboardEvent) => {
              const currentTextLength = (event.target as HTMLInputElement).value.length;
              if (currentTextLength === maxDescriptionCharacters && event.key !== 'Backspace') {
                event.preventDefault();
              }
            }}
          />
          {getErrorMessage('description') && <p className="mt-1 text-xs text-red-500">{getErrorMessage('description')}</p>}
          <span className="flex justify-end text-[#95979d] text-xs">{allowedInfoLength.description} ký tự</span>
        </div>
      </div>
      <div className="grid md:grid-cols-5 mb-6">
        <div className="text-base font-medium pb-2">
          Thời gian phản hồi<sup className="text-red-500 text-base top-[-0.3em]">*</sup>
        </div>
        <div className="w-full col-span-4">
          <TextInput
            className="show-number-spinner w-full rounded border border-grey p-2.5 mb-1 text-sm font-normal text-gray-600 focus:outline-none"
            type="number"
            name="responseTime"
            min={1}
            step={1}
            placeholder="Ví dụ: 1"
            value={personalInfo.responseTime}
            onChange={(event: ChangeEvent) => {
              const value = (event.target as HTMLInputElement).value;
              setPersonalInfo({ ...personalInfo, responseTime: parseInt(value) > 0 ? value : '' });
            }}
            onKeyDown={(event: KeyboardEvent) => {
              if (['e', 'E', '+', '-', '.'].includes(event.key)) {
                event.preventDefault();
              }
            }}
          />
          {getErrorMessage('responseTime') && <p className="mt-1 text-xs text-red-500">{getErrorMessage('responseTime')}</p>}
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo;
