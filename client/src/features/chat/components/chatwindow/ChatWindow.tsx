import { filter, find } from 'lodash';
import { ChangeEvent, FC, FormEvent, ReactElement, useEffect, useRef, useState } from 'react';
import { FaPaperclip, FaPaperPlane } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import { IBuyerDocument } from 'src/features/buyer/interfaces/buyer.interface';
import { useGetBuyerByUsernameQuery, useGetCurrentBuyerByUsernameQuery } from 'src/features/buyer/services/buyer.service';
import { useGetGigByIdQuery } from 'src/features/gigs/services/gigs.service';
import { useGetSellerByUsernameQuery } from 'src/features/sellers/services/seller.service';
import Button from 'src/shared/button/Button';
import { updateNotification } from 'src/shared/header/reducers/notification.reducer';
import TextInput from 'src/shared/inputs/TextInput';
import OfferModal from 'src/shared/modals/OfferModal';
import { checkFile, fileType, readAsBase64 } from 'src/shared/utils/image-utils.service';
import { TimeAgo } from 'src/shared/utils/timeago.utils';
import { firstLetterUppercase, lowerCase, showErrorToast } from 'src/shared/utils/utils.service';
import { socket, socketService } from 'src/sockets/socket.service';
import { useAppDispatch, useAppSelector } from 'src/store/store';
import { IReduxState } from 'src/store/store.interface';
import { v4 as uuidv4 } from 'uuid';

import useChatScrollToBottom from '../../hooks/useChatScrollToBottom';
import { IChatWindowProps, IMessageDocument } from '../../interfaces/chat.interface';
import { useSaveChatMessageMutation } from '../../services/chat.service';
import ChatFile from './ChatFile';
import ChatImagePreview from './ChatImagePreview';
import ChatOffer from './ChatOffer';

const MESSAGE_STATUS = {
  EMPTY: '',
  IS_LOADING: false,
  LOADING: true
};
const NOT_EXISTING_ID = '649db27404c0c7b7d4b112ec';

const isUsableText = (value?: string | null): value is string => {
  const normalizedValue = `${value ?? ''}`.trim();
  return !!normalizedValue && normalizedValue !== 'undefined' && normalizedValue !== 'null';
};

const firstUsableText = (...values: Array<string | null | undefined>): string | undefined => {
  return values.find(isUsableText);
};

const ChatWindow: FC<IChatWindowProps> = ({ chatMessages, draftConversation, isLoading, setSkip }): ReactElement => {
  const seller = useAppSelector((state: IReduxState) => state.seller);
  const buyer = useAppSelector((state: IReduxState) => state.buyer);
  const authUser = useAppSelector((state: IReduxState) => state.authUser);
  const fileRef = useRef<HTMLInputElement>(null);
  const scrollRef = useChatScrollToBottom([]);
  const { username, conversationId } = useParams<string>();
  const receiverUsername = useRef<string>(MESSAGE_STATUS.EMPTY);
  const receiverRef = useRef<IBuyerDocument>();
  const singleMessageRef = useRef<IMessageDocument>();
  const [showImagePreview, setShowImagePreview] = useState<boolean>(MESSAGE_STATUS.IS_LOADING);
  const [displayCustomOffer, setDisplayCustomOffer] = useState<boolean>(MESSAGE_STATUS.IS_LOADING);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState<boolean>(MESSAGE_STATUS.IS_LOADING);
  const [message, setMessage] = useState<string>(MESSAGE_STATUS.EMPTY);
  const [hasConversationId, setHasConversationId] = useState<boolean>(draftConversation?.hasConversationId ?? true);
  const dispatch = useAppDispatch();
  const routeReceiverUsername = firstUsableText(username);
  const { data: currentBuyerData } = useGetCurrentBuyerByUsernameQuery();
  const activeBuyer = firstUsableText(buyer?._id) ? buyer : currentBuyerData?.buyer;
  const draftReceiver =
    draftConversation && lowerCase(`${authUser?.username}`) === lowerCase(draftConversation.seller.username)
      ? draftConversation.buyer
      : draftConversation?.seller;
  const { data: buyerData, isSuccess: isBuyerSuccess } = useGetBuyerByUsernameQuery(`${routeReceiverUsername || ''}`, {
    skip: !routeReceiverUsername
  });
  const { data: sellerData, isSuccess: isSellerSuccess } = useGetSellerByUsernameQuery(`${routeReceiverUsername || ''}`, {
    skip: !routeReceiverUsername
  });
  const { data } = useGetGigByIdQuery(
    singleMessageRef.current ? `${singleMessageRef.current?.gigId}` : draftConversation?.gigId ?? NOT_EXISTING_ID
  );
  const [saveChatMessage] = useSaveChatMessageMutation();
  const receiverBuyer = isBuyerSuccess ? buyerData?.buyer : undefined;
  const receiverSeller = isSellerSuccess ? sellerData?.seller : undefined;

  if (receiverBuyer) {
    receiverRef.current = receiverBuyer;
  }

  if (receiverSeller && lowerCase(`${receiverRef.current?.username}`) !== lowerCase(`${receiverSeller.username}`)) {
    receiverRef.current = {
      ...receiverRef.current,
      _id: receiverSeller._id,
      country: receiverSeller.country ?? receiverRef.current?.country ?? '',
      email: receiverSeller.email ?? receiverRef.current?.email ?? '',
      profilePicture: receiverSeller.profilePicture ?? '',
      purchasedGigs: receiverRef.current?.purchasedGigs ?? [],
      username: receiverSeller.username ?? ''
    };
  }

  if (draftReceiver && lowerCase(`${receiverRef.current?.username}`) !== lowerCase(draftReceiver.username)) {
    receiverRef.current = {
      ...receiverRef.current,
      country: receiverRef.current?.country ?? '',
      profilePicture: draftReceiver.profilePicture,
      purchasedGigs: receiverRef.current?.purchasedGigs ?? [],
      username: draftReceiver.username
    };
  }

  if (chatMessages.length) {
    singleMessageRef.current = chatMessages[chatMessages.length - 1];
  } else if (draftConversation) {
    singleMessageRef.current = {
      buyerId: draftConversation.buyer._id,
      conversationId: draftConversation.conversationId,
      gigId: draftConversation.gigId,
      receiverPicture: draftReceiver?.profilePicture,
      receiverUsername: draftReceiver?.username,
      sellerId: draftConversation.seller._id
    };
  }

  const currentMessage = singleMessageRef.current;
  const authUsername = `${authUser?.username ?? ''}`;
  const receiverProfile = receiverSeller || receiverBuyer || draftReceiver;
  const currentUserIsDraftSeller = lowerCase(authUsername) === lowerCase(`${draftConversation?.seller.username ?? ''}`);
  const currentUserIsMessageSeller = firstUsableText(currentMessage?.sellerId, seller?._id) ? currentMessage?.sellerId === seller?._id : false;
  const currentUserIsSeller = currentUserIsDraftSeller || currentUserIsMessageSeller;
  const lastMessageReceiverUsername =
    lowerCase(`${currentMessage?.senderUsername ?? ''}`) === lowerCase(authUsername)
      ? currentMessage?.receiverUsername
      : currentMessage?.senderUsername;
  const lastMessageReceiverPicture =
    lowerCase(`${currentMessage?.senderUsername ?? ''}`) === lowerCase(authUsername)
      ? currentMessage?.receiverPicture
      : currentMessage?.senderPicture;
  const resolvedConversationId = firstUsableText(currentMessage?.conversationId, conversationId, draftConversation?.conversationId);
  const resolvedGigId = firstUsableText(currentMessage?.gigId, draftConversation?.gigId, data?.gig?._id, data?.gig?.id);
  const resolvedBuyerId = firstUsableText(
    draftConversation?.buyer._id,
    currentMessage?.buyerId,
    currentUserIsSeller ? firstUsableText(receiverBuyer?._id, receiverRef.current?._id) : activeBuyer?._id
  );
  const resolvedSellerId = firstUsableText(
    draftConversation?.seller._id,
    currentMessage?.sellerId,
    receiverSeller?._id,
    data?.gig?.sellerId,
    currentUserIsSeller ? seller?._id : undefined
  );
  const resolvedReceiverUsername = firstUsableText(
    receiverProfile?.username,
    receiverRef.current?.username,
    draftReceiver?.username,
    lastMessageReceiverUsername,
    routeReceiverUsername
  );
  const resolvedReceiverPicture = firstUsableText(
    receiverProfile?.profilePicture,
    receiverRef.current?.profilePicture,
    draftReceiver?.profilePicture,
    lastMessageReceiverPicture,
    'https://placehold.co/150x150?text=Anh+dai+dien'
  );
  const receiver = resolvedReceiverUsername
    ? {
        ...receiverRef.current,
        country: receiverRef.current?.country ?? '',
        profilePicture: resolvedReceiverPicture ?? receiverRef.current?.profilePicture ?? '',
        purchasedGigs: receiverRef.current?.purchasedGigs ?? [],
        username: resolvedReceiverUsername
      }
    : receiverRef.current;
  const messageContext: IMessageDocument | undefined = currentMessage || draftConversation || resolvedConversationId
    ? {
        ...currentMessage,
        buyerId: resolvedBuyerId,
        conversationId: resolvedConversationId,
        gigId: resolvedGigId,
        receiverPicture: resolvedReceiverPicture,
        receiverUsername: resolvedReceiverUsername,
        sellerId: resolvedSellerId
      }
    : undefined;
  const isAdminChat = !!(chatMessages.some((m) => m.isAdminChat) || draftConversation?.isAdminChat);
  const sellerAccountIsLocked = seller?.accountStatus === 'ACCOUNT_LOCKED';
  const canCreateCustomOffer =
    !isAdminChat && !showImagePreview && hasConversationId && messageContext?.sellerId === seller?._id && !sellerAccountIsLocked;

  const handleFileChange = (event: ChangeEvent): void => {
    const target: HTMLInputElement = event.target as HTMLInputElement;
    if (target.files) {
      const file: File = target.files[0];
      if (!checkFile(file)) {
        setSelectedFile(file);
        setShowImagePreview(MESSAGE_STATUS.LOADING);
      }
    }
  };

  const setChatMessage = (event: ChangeEvent): void => {
    setMessage((event.target as HTMLInputElement).value);
  };

  const sendMessage = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    if (!message && !selectedFile) {
      return;
    }
    if (!messageContext) {
      showErrorToast('Không thể xác định người nhận. Vui lòng tải lại cuộc trò chuyện.');
      return;
    }
    if (!isAdminChat && (!messageContext.buyerId || !messageContext.sellerId || !messageContext.receiverUsername || !messageContext.receiverPicture)) {
      showErrorToast('Không thể xác định người nhận. Vui lòng tải lại cuộc trò chuyện.');
      return;
    }
    if (isAdminChat && (!messageContext.receiverUsername || !messageContext.receiverPicture)) {
      showErrorToast('Không thể xác định người nhận. Vui lòng tải lại cuộc trò chuyện.');
      return;
    }
    if (setSkip) {
      setSkip(true);
    }
    try {
      setIsUploadingFile(MESSAGE_STATUS.LOADING);
      const messageBody: IMessageDocument = {
        conversationId: messageContext.conversationId,
        hasConversationId,
        body: message,
        gigId: messageContext.gigId,
        sellerId: messageContext.sellerId,
        buyerId: messageContext.buyerId,
        senderUsername: `${authUser?.username}`,
        senderPicture: `${authUser?.profilePicture}`,
        receiverUsername: messageContext.receiverUsername,
        receiverPicture: messageContext.receiverPicture,
        isRead: false,
        hasOffer: false,
        isAdminChat: isAdminChat || undefined
      };
      if (selectedFile) {
        const dataImage: string | ArrayBuffer | null = await readAsBase64(selectedFile);
        messageBody.file = dataImage as string;
        messageBody.body = messageBody.body ? messageBody.body : 'Đã gửi 1 tệp';
        messageBody.fileType = fileType(selectedFile);
        messageBody.fileName = selectedFile.name;
        messageBody.fileSize = `${selectedFile.size}`;
      }
      await saveChatMessage(messageBody).unwrap();
      setHasConversationId(true);
      setSelectedFile(null);
      setShowImagePreview(MESSAGE_STATUS.IS_LOADING);
      setMessage(MESSAGE_STATUS.EMPTY);
      setIsUploadingFile(MESSAGE_STATUS.IS_LOADING);
    } catch (error) {
      setMessage(MESSAGE_STATUS.EMPTY);
      setIsUploadingFile(MESSAGE_STATUS.IS_LOADING);
      showErrorToast('Không thể gửi tin nhắn.');
    }
  };

  useEffect(() => {
    setHasConversationId(draftConversation?.hasConversationId ?? true);
  }, [draftConversation?.conversationId, draftConversation?.hasConversationId]);

  useEffect(() => {
    const list: IMessageDocument[] = filter(chatMessages, (item: IMessageDocument) => !item.isRead && item.receiverUsername === username);
    dispatch(updateNotification({ hasUnreadMessage: list.length > 0 }));
  }, [chatMessages, dispatch, username]);

  useEffect(() => {
    socketService.setupSocketConnection();
    socket.emit('getLoggedInUsers', '');
    socket.on('online', (data: string[]) => {
      receiverUsername.current = find(data, (name: string) => name === receiverRef?.current?.username) as string;
    });
  }, []);

  return (
    <>
      {!isLoading && displayCustomOffer && canCreateCustomOffer && (
          <OfferModal
          header="Tạo đề nghị tùy chỉnh"
          singleMessage={messageContext}
          receiver={receiver}
          authUser={authUser}
          cancelBtnHandler={() => setDisplayCustomOffer(MESSAGE_STATUS.IS_LOADING)}
        />
      )}
      {!isLoading && (
        <div className="flex min-h-full w-full flex-col">
          <div className="border-grey flex w-full flex-col border-b px-5 py-0.5 ">
            {receiverUsername.current === receiverRef?.current?.username ? (
              <>
                <div className="text-lg font-semibold">{firstLetterUppercase(`${username}`)}</div>
                <div className="flex gap-1 pb-1 text-xs font-normal">
                  Đang trực tuyến
                  <span className="flex h-2.5 w-2.5 self-center rounded-full border-2 border-white bg-green-400"></span>
                </div>
              </>
            ) : (
              <>
                <div className="py-2.5 text-lg font-semibold">{firstLetterUppercase(`${username}`)}</div>
                <span className="py-2.5s text-xs font-normal"></span>
              </>
            )}
          </div>
          <div className="relative h-[100%]">
            <div className="absolute flex h-[98%] w-screen grow flex-col overflow-scroll" ref={scrollRef}>
              {chatMessages.map((message: IMessageDocument) => (
                <div key={uuidv4()} className="mb-4">
                  <div className="flex w-full cursor-pointer items-center space-x-4 px-5 py-2 hover:bg-[#f5fbff]">
                    <div className="flex self-start">
                      <img className="h-10 w-10 object-cover rounded-full" src={message.senderPicture} alt="" />
                    </div>
                    <div className="w-full text-sm dark:text-white">
                      <div className="flex gap-x-2 pb-1 font-bold text-[#777d74]">
                        <span>{message.senderUsername}</span>
                        <span className="mt-1 self-center text-xs font-normal">{TimeAgo.dayMonthYear(`${message.createdAt}`)}</span>
                      </div>
                      <div className="flex flex-col text-[#777d74]">
                        <span>{message.body}</span>
                        {message.hasOffer && <ChatOffer message={message} seller={seller} gig={data?.gig} />}
                        {message.file && <ChatFile message={message} />}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative z-10 flex flex-col">
            {showImagePreview && (
              <ChatImagePreview
                image={URL.createObjectURL(selectedFile as File)}
                file={selectedFile as File}
                isLoading={isUploadingFile}
                message={message}
                handleChange={setChatMessage}
                onSubmit={sendMessage}
                onRemoveImage={() => {
                  setSelectedFile(null);
                  setShowImagePreview(MESSAGE_STATUS.IS_LOADING);
                }}
              />
            )}
            {!showImagePreview && (
              <div className="bottom-0 left-0 right-0 z-0 h-28 px-4 ">
                <form onSubmit={sendMessage} className="mb-1 w-full">
                  <TextInput
                    type="text"
                    name="message"
                    value={message}
                    className="border-grey mb-1 w-full rounded border p-3.5 text-sm font-normal text-gray-600 focus:outline-none"
                    placeholder="Nhập tin nhắn của bạn..."
                    onChange={(event: ChangeEvent) => setMessage((event.target as HTMLInputElement).value)}
                  />
                </form>
                <div className="flex cursor-pointer flex-row justify-between">
                  <div className="flex gap-4">
                    {!showImagePreview && <FaPaperclip className="mt-1 self-center" onClick={() => fileRef?.current?.click()} />}
                    {canCreateCustomOffer && (
                      <Button
                        className="rounded bg-sky-500 px-6 py-3 text-center text-sm font-bold text-white hover:bg-sky-400 focus:outline-none md:px-4 md:py-2 md:text-base"
                        disabled={false}
                        label="Tạo đơn hàng"
                        onClick={() => setDisplayCustomOffer(MESSAGE_STATUS.LOADING)}
                      />
                    )}
                    <TextInput
                      name="chatFile"
                      ref={fileRef}
                      type="file"
                      style={{ display: 'none' }}
                      onClick={() => {
                        if (fileRef.current) {
                          fileRef.current.value = '';
                        }
                      }}
                      onChange={handleFileChange}
                    />
                  </div>
                  <div className="flex gap-4">
                    <Button
                      className="rounded bg-sky-500 px-6 py-3 text-center text-sm font-bold text-white hover:bg-sky-400 focus:outline-none md:px-4 md:py-2 md:text-base"
                      disabled={false}
                      label={<FaPaperPlane className="self-center" />}
                      onClick={sendMessage}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWindow;
