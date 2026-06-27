/* eslint-disable prettier/prettier */
import { ChangeEvent, FC, ReactElement, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { IMessageDocument } from 'src/features/chat/interfaces/chat.interface';
import { useSaveChatMessageMutation } from 'src/features/chat/services/chat.service';

import Button from '../button/Button';
import Dropdown from '../dropdown/Dropdown';
import TextAreaInput from '../inputs/TextAreaInput';
import TextInput from '../inputs/TextInput';
import { formatVnd, formatVndNumber, GIG_MAX_PRICE_VND, GIG_MIN_PRICE_VND, parseVndInput } from '../utils/currency.utils';
import { expectedGigDelivery, showErrorToast } from '../utils/utils.service';
import { IModalProps } from './interfaces/modal.interface';
import ModalBg from './ModalBg';

interface ISellerOffer {
  description: string;
  price: string;
  delivery: string;
  deliveryDate: string;
}

interface IOfferErrors {
  description?: string;
  price?: string;
  delivery?: string;
}

const cleanRequiredText = (value?: string | null): string | undefined => {
  const normalizedValue = `${value ?? ''}`.trim();
  return normalizedValue && normalizedValue !== 'undefined' && normalizedValue !== 'null' ? normalizedValue : undefined;
};

const OfferModal: FC<IModalProps> = ({ header, gigTitle, receiver, authUser, singleMessage, cancelBtnHandler }): ReactElement => {
  const [offer, setOffer] = useState<ISellerOffer>({
    description: '',
    price: '',
    delivery: 'Thời gian giao dự kiến',
    deliveryDate: ''
  });
  const [fieldErrors, setFieldErrors] = useState<IOfferErrors>({});
  const [saveChatMessage, { isLoading }] = useSaveChatMessageMutation();
  const offerPrice = Number(parseVndInput(offer.price));
  const offerHasValidPrice = Number.isInteger(offerPrice) && offerPrice >= GIG_MIN_PRICE_VND && offerPrice <= GIG_MAX_PRICE_VND;

  const validateOffer = (): IOfferErrors => {
    const errors: IOfferErrors = {};
    if (!offer.description.trim()) {
      errors.description = 'Vui lòng nhập mô tả đề nghị';
    }
    if (!offer.price) {
      errors.price = 'Vui lòng nhập giá đề nghị';
    } else if (!offerHasValidPrice) {
      errors.price = `Giá đề nghị phải từ ${formatVnd(GIG_MIN_PRICE_VND)} đến ${formatVnd(GIG_MAX_PRICE_VND)}.`;
    }
    if (!offer.deliveryDate) {
      errors.delivery = 'Vui lòng chọn thời gian giao';
    }
    return errors;
  };

  const sendGigOffer = async (): Promise<void> => {
    try {
      const errors = validateOffer();
      setFieldErrors(errors);
      if (Object.keys(errors).length > 0) {
        return;
      }

      const conversationId = cleanRequiredText(singleMessage?.conversationId);
      const gigId = cleanRequiredText(singleMessage?.gigId);
      const sellerId = cleanRequiredText(singleMessage?.sellerId);
      const buyerId = cleanRequiredText(singleMessage?.buyerId);
      const senderUsername = cleanRequiredText(authUser?.username);
      const senderPicture = cleanRequiredText(authUser?.profilePicture);
      const receiverUsername = cleanRequiredText(receiver?.username);
      const receiverPicture = cleanRequiredText(receiver?.profilePicture);
      if (!conversationId || !gigId || !sellerId || !buyerId || !senderUsername || !senderPicture || !receiverUsername || !receiverPicture) {
        showErrorToast('Không thể xác định người mua hoặc người nhận. Vui lòng tải lại cuộc trò chuyện.');
        return;
      }

      const messageBody: IMessageDocument = {
        conversationId,
        hasConversationId: true,
        body: 'Đây là đề nghị tùy chỉnh của bạn',
        gigId,
        sellerId,
        buyerId,
        senderUsername,
        senderPicture,
        receiverUsername,
        receiverPicture,
        isRead: false,
        hasOffer: true,
        offer: {
          gigTitle: `${gigTitle}`,
          price: offerPrice,
          description: offer.description.trim(),
          deliveryInDays: parseInt(offer.delivery),
          oldDeliveryDate: offer.deliveryDate,
          newDeliveryDate: offer.deliveryDate,
          accepted: false,
          cancelled: false
        }
      };
      await saveChatMessage(messageBody).unwrap();
      if (cancelBtnHandler) {
        cancelBtnHandler();
      }
    } catch (error) {
      showErrorToast('Không thể gửi đề nghị gig.');
    }
  };

  return (
    <ModalBg>
      <div className="fixed bottom-0 left-0 right-0 top-0 z-[30] flex w-full items-center justify-center">
        <div className="relative bottom-auto left-auto right-auto top-auto max-h-[90vh] min-w-[500px] bg-white p-4">
          <div className="relative px-5 py-5">
            <div className="flex justify-between text-2xl font-bold ">
              <h1 className="flex w-full justify-center">{header}</h1>
              <Button
                onClick={cancelBtnHandler}
                className="cursor-pointer rounded text-gray-400 hover:text-gray-600"
                role="button"
                label={<FaTimes className="" />}
              />
            </div>
          </div>

          <div className="relative mb-16 px-5">
            <div className="py-4">
              <label htmlFor="username" className="text-[20px] font-medium leading-tight tracking-normal">
                {gigTitle}
              </label>
            </div>
            <div>
              <label htmlFor="description" className="text-sm font-bold leading-tight tracking-normal">
                Mô tả<sup className="top-[-0.1em] text-base text-red-500">*</sup>
              </label>
              <TextAreaInput
                className="border-grey mb-1 w-full rounded border p-2.5 text-sm font-normal text-gray-600 focus:outline-none"
                placeholder="Viết mô tả..."
                name="description"
                value={offer.description}
                rows={5}
                onChange={(event: ChangeEvent) => {
                  setOffer({ ...offer, description: (event.target as HTMLInputElement).value });
                  setFieldErrors({ ...fieldErrors, description: '' });
                }}
              />
              {fieldErrors.description && <p className="mt-1 text-xs text-red-500">{fieldErrors.description}</p>}
            </div>
            <div>
              <label htmlFor="price" className="text-sm font-bold leading-tight tracking-normal">
                Giá<sup className="top-[-0.1em] text-base text-red-500">*</sup>
              </label>
              <div className="relative mb-5 mt-2">
                <TextInput
                  id="price"
                  name="price"
                  type="text"
                  inputMode="numeric"
                  value={offer.price ? formatVndNumber(offer.price) : ''}
                  className="flex h-10 w-full items-center rounded border border-gray-300 pl-3 text-sm font-normal text-gray-600 focus:border focus:border-sky-500/50 focus:outline-none"
                  placeholder="Nhập giá tùy chỉnh bằng VND"
                  min={GIG_MIN_PRICE_VND}
                  max={GIG_MAX_PRICE_VND}
                  step={1}
                  onChange={(event: ChangeEvent) => {
                    const value = parseVndInput((event.target as HTMLInputElement).value);
                    setOffer({ ...offer, price: value });
                    setFieldErrors({ ...fieldErrors, price: '' });
                  }}
                />
                {fieldErrors.price && <p className="mt-1 text-xs text-red-500">{fieldErrors.price}</p>}
              </div>
            </div>
            <div className="mb-6">
              <label htmlFor="country" className="text-sm font-bold leading-tight tracking-normal">
                Thời gian giao<sup className="top-[-0.1em] text-base text-red-500">*</sup>
              </label>
              <div id="country" className="relative mb-5 mt-2">
                <Dropdown
                  text={offer.delivery}
                  maxHeight="200"
                  mainClassNames="absolute bg-white z-50"
                  showSearchInput={false}
                  values={expectedGigDelivery()}
                  onClick={(item: string) => {
                    const deliveryInDays: number = parseInt(item);
                    const newDate: Date = new Date();
                    newDate.setDate(newDate.getDate() + deliveryInDays);
                    setOffer({ ...offer, deliveryDate: `${newDate}`, delivery: item });
                    setFieldErrors({ ...fieldErrors, delivery: '' });
                  }}
                />
                {fieldErrors.delivery && <p className="mt-12 text-xs text-red-500">{fieldErrors.delivery}</p>}
              </div>
            </div>
          </div>

          <div className="px-5 py-4">
            <div className="ml-2 flex w-full justify-center text-sm font-medium">
              <Button
                className="rounded bg-sky-500 px-6 py-3 text-center text-sm font-bold text-white hover:bg-sky-400 focus:outline-none md:px-4 md:py-2 md:text-base"
                disabled={isLoading}
                label={isLoading ? 'Đang gửi...' : 'Gửi đề nghị'}
                onClick={sendGigOffer}
              />
            </div>
          </div>
        </div>
      </div>
    </ModalBg>
  );
};

export default OfferModal;
