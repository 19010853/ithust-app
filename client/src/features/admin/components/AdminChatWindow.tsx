import { ChangeEvent, FC, FormEvent, ReactElement, useEffect, useRef, useState } from 'react';
import { FaPaperclip, FaPaperPlane } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import { useGetBuyerByUsernameQuery } from 'src/features/buyer/services/buyer.service';
import { useGetSellerByUsernameQuery } from 'src/features/sellers/services/seller.service';
import Button from 'src/shared/button/Button';
import { updateNotification } from 'src/shared/header/reducers/notification.reducer';
import TextInput from 'src/shared/inputs/TextInput';
import { checkFile, fileType, readAsBase64 } from 'src/shared/utils/image-utils.service';
import { TimeAgo } from 'src/shared/utils/timeago.utils';
import { firstLetterUppercase, showErrorToast } from 'src/shared/utils/utils.service';
import { socket, socketService } from 'src/sockets/socket.service';
import { useAppDispatch, useAppSelector } from 'src/store/store';
import { IReduxState } from 'src/store/store.interface';
import { v4 as uuidv4 } from 'uuid';
import { find, filter } from 'lodash';

import useChatScrollToBottom from 'src/features/chat/hooks/useChatScrollToBottom';
import { IChatWindowProps, IMessageDocument } from 'src/features/chat/interfaces/chat.interface';
import { useSaveChatMessageMutation } from 'src/features/chat/services/chat.service';
import ChatFile from 'src/features/chat/components/chatwindow/ChatFile';
import ChatImagePreview from 'src/features/chat/components/chatwindow/ChatImagePreview';

const isUsableText = (value?: string | null): value is string => {
  const v = `${value ?? ''}`.trim();
  return !!v && v !== 'undefined' && v !== 'null';
};

const firstUsableText = (...values: Array<string | null | undefined>): string | undefined =>
  values.find(isUsableText);

const AdminChatWindow: FC<IChatWindowProps> = ({ chatMessages, draftConversation, isLoading, isError, setSkip }): ReactElement => {
  const authUser = useAppSelector((state: IReduxState) => state.authUser);
  const fileRef = useRef<HTMLInputElement>(null);
  const scrollRef = useChatScrollToBottom(chatMessages);
  const { username, conversationId } = useParams<string>();
  const onlineReceiverRef = useRef<string>('');
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [message, setMessage] = useState('');
  const [hasConversationId, setHasConversationId] = useState(draftConversation?.hasConversationId ?? true);
  const dispatch = useAppDispatch();
  const [saveChatMessage] = useSaveChatMessageMutation();

  const routeUsername = firstUsableText(username);

  const { data: sellerData, isSuccess: isSellerSuccess } = useGetSellerByUsernameQuery(
    `${routeUsername || ''}`,
    { skip: !routeUsername }
  );
  const { data: buyerData, isSuccess: isBuyerSuccess } = useGetBuyerByUsernameQuery(
    `${routeUsername || ''}`,
    { skip: !routeUsername }
  );

  // draftConversation.seller = the target user (non-admin participant)
  const draftTargetUser =
    draftConversation &&
    draftConversation.seller.username.toLowerCase() !== authUser.username?.toLowerCase()
      ? draftConversation.seller
      : draftConversation?.buyer;

  const lastMessage = chatMessages.length ? chatMessages[chatMessages.length - 1] : undefined;
  const authUsername = `${authUser?.username ?? ''}`;

  const resolvedReceiverUsername = firstUsableText(
    isSellerSuccess ? sellerData?.seller?.username : undefined,
    isBuyerSuccess ? buyerData?.buyer?.username : undefined,
    draftTargetUser?.username,
    lastMessage
      ? lastMessage.senderUsername?.toLowerCase() === authUsername.toLowerCase()
        ? lastMessage.receiverUsername
        : lastMessage.senderUsername
      : undefined,
    routeUsername
  );

  const resolvedReceiverPicture = firstUsableText(
    isSellerSuccess ? sellerData?.seller?.profilePicture : undefined,
    isBuyerSuccess ? buyerData?.buyer?.profilePicture : undefined,
    draftTargetUser?.profilePicture,
    lastMessage
      ? lastMessage.senderUsername?.toLowerCase() === authUsername.toLowerCase()
        ? lastMessage.receiverPicture
        : lastMessage.senderPicture
      : undefined,
    'https://placehold.co/150x150?text=U'
  );

  const resolvedConversationId = firstUsableText(
    lastMessage?.conversationId,
    conversationId,
    draftConversation?.conversationId
  );

  const resolvedSellerId = isSellerSuccess ? sellerData?.seller?._id || '' : '';

  useEffect(() => {
    socketService.setupSocketConnection();
    socket.emit('getLoggedInUsers', '');
    socket.on('online', (data: string[]) => {
      onlineReceiverRef.current = find(data, (name) => name === resolvedReceiverUsername) as string;
    });
  }, []);

  useEffect(() => {
    setHasConversationId(draftConversation?.hasConversationId ?? true);
  }, [draftConversation?.conversationId, draftConversation?.hasConversationId]);

  useEffect(() => {
    const list: IMessageDocument[] = filter(
      chatMessages,
      (item: IMessageDocument) => !item.isRead && item.receiverUsername === authUsername
    );
    dispatch(updateNotification({ hasUnreadMessage: list.length > 0 }));
  }, [chatMessages, dispatch, authUsername]);

  const handleFileChange = (event: ChangeEvent): void => {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      const file = target.files[0];
      if (!checkFile(file)) {
        setSelectedFile(file);
        setShowImagePreview(true);
      }
    }
  };

  const sendMessage = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    if (!message && !selectedFile) return;
    if (!resolvedReceiverUsername || !resolvedReceiverPicture) {
      showErrorToast('Không thể xác định người nhận. Vui lòng tải lại cuộc trò chuyện.');
      return;
    }
    if (setSkip) setSkip(true);
    try {
      setIsUploadingFile(true);
      const messageBody: IMessageDocument = {
        conversationId: resolvedConversationId,
        hasConversationId,
        body: message,
        gigId: '',
        sellerId: resolvedSellerId,
        buyerId: '',
        isAdminChat: true,
        senderUsername: authUsername,
        senderPicture: `${authUser?.profilePicture || ''}`,
        receiverUsername: resolvedReceiverUsername,
        receiverPicture: resolvedReceiverPicture,
        isRead: false,
        hasOffer: false
      };
      if (selectedFile) {
        const dataImage = await readAsBase64(selectedFile);
        messageBody.file = dataImage as string;
        messageBody.body = messageBody.body ? messageBody.body : 'Đã gửi 1 tệp';
        messageBody.fileType = fileType(selectedFile);
        messageBody.fileName = selectedFile.name;
        messageBody.fileSize = `${selectedFile.size}`;
      }
      await saveChatMessage(messageBody).unwrap();
      setHasConversationId(true);
      setSelectedFile(null);
      setShowImagePreview(false);
      setMessage('');
      setIsUploadingFile(false);
    } catch {
      setMessage('');
      setIsUploadingFile(false);
      showErrorToast('Không thể gửi tin nhắn.');
    }
  };

  return (
    <>
      {!isLoading && (
        <div className="flex min-h-full w-full flex-col">
          <div className="border-grey flex w-full flex-col border-b px-5 py-0.5 ">
            {onlineReceiverRef.current === resolvedReceiverUsername ? (
              <>
                <div className="text-lg font-semibold">{firstLetterUppercase(`${resolvedReceiverUsername || username}`)}</div>
                <div className="flex gap-1 pb-1 text-xs font-normal">
                  Đang trực tuyến
                  <span className="flex h-2.5 w-2.5 self-center rounded-full border-2 border-white bg-green-400"></span>
                </div>
              </>
            ) : (
              <>
                <div className="py-2.5 text-lg font-semibold">{firstLetterUppercase(`${resolvedReceiverUsername || username}`)}</div>
                <span className="py-2.5s text-xs font-normal"></span>
              </>
            )}
          </div>

          <div className="relative h-[100%]">
            <div className="absolute flex h-[98%] w-screen grow flex-col overflow-scroll" ref={scrollRef}>
              {isError && (
                <div className="flex w-full items-center justify-center py-4 text-sm text-red-500">
                  Không tải được tin nhắn. Vui lòng tải lại trang.
                </div>
              )}
              {chatMessages.map((msg: IMessageDocument) => (
                <div key={uuidv4()} className="mb-4">
                  <div className="flex w-full cursor-pointer items-center space-x-4 px-5 py-2 hover:bg-[#f5fbff]">
                    <div className="flex self-start">
                      <img className="h-10 w-10 object-cover rounded-full" src={msg.senderPicture} alt="" />
                    </div>
                    <div className="w-full text-sm dark:text-white">
                      <div className="flex gap-x-2 pb-1 font-bold text-[#777d74]">
                        <span>{msg.senderUsername}</span>
                        <span className="mt-1 self-center text-xs font-normal">{TimeAgo.dayMonthYear(`${msg.createdAt}`)}</span>
                      </div>
                      <div className="flex flex-col text-[#777d74]">
                        <span>{msg.body}</span>
                        {msg.file && <ChatFile message={msg} />}
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
                handleChange={(e: ChangeEvent) => setMessage((e.target as HTMLInputElement).value)}
                onSubmit={sendMessage}
                onRemoveImage={() => {
                  setSelectedFile(null);
                  setShowImagePreview(false);
                }}
              />
            )}
            {!showImagePreview && (
              <div className="bottom-0 left-0 right-0 z-0 h-28 px-4">
                <form onSubmit={sendMessage} className="mb-1 w-full">
                  <TextInput
                    type="text"
                    name="message"
                    value={message}
                    className="border-grey mb-1 w-full rounded border p-3.5 text-sm font-normal text-gray-600 focus:outline-none"
                    placeholder="Nhập tin nhắn của bạn..."
                    onChange={(e: ChangeEvent) => setMessage((e.target as HTMLInputElement).value)}
                  />
                </form>
                <div className="flex cursor-pointer flex-row justify-between">
                  <div className="flex gap-4">
                    <FaPaperclip className="mt-1 self-center" onClick={() => fileRef?.current?.click()} />
                    <TextInput
                      name="chatFile"
                      ref={fileRef}
                      type="file"
                      style={{ display: 'none' }}
                      onClick={() => {
                        if (fileRef.current) fileRef.current.value = '';
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

export default AdminChatWindow;
