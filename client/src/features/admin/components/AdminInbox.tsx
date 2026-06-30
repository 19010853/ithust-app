import { FC, ReactElement, useEffect, useRef, useState } from 'react';
import { NavigateFunction, useLocation, useNavigate, useParams } from 'react-router-dom';
import { lowerCase, showErrorToast } from 'src/shared/utils/utils.service';
import { useAppSelector } from 'src/store/store';
import { IReduxState } from 'src/store/store.interface';
import { v4 as uuidv4 } from 'uuid';

import { IConversationDocument, IInboxDraftConversation, IMessageDocument } from 'src/features/chat/interfaces/chat.interface';
import { chatMessageReceived } from 'src/features/chat/services/chat.utils';
import { useLazyGetConversationQuery, useGetUserMessagesQuery } from 'src/features/chat/services/chat.service';
import ChatList from 'src/features/chat/components/chatlist/ChatList';
import AdminChatWindow from './AdminChatWindow';

const AdminInbox: FC = (): ReactElement => {
  const { conversationId, username } = useParams<string>();
  const location = useLocation();
  const navigate: NavigateFunction = useNavigate();
  const authUser = useAppSelector((state: IReduxState) => state.authUser);

  const draftConversation = (location.state as { draftConversation?: IInboxDraftConversation } | null)?.draftConversation;
  const activeDraftConversation = draftConversation?.conversationId === conversationId ? draftConversation : undefined;

  const chatMessages = useRef<IMessageDocument[]>([]);
  const [skip, setSkip] = useState<boolean>(false);
  const [chatMessagesData, setChatMessagesData] = useState<IMessageDocument[]>([]);
  const hasLookedUpConv = useRef(false);

  const { data, isSuccess, isLoading, isError } = useGetUserMessagesQuery(
    `${conversationId}`,
    { skip: !conversationId || skip }
  );
  const [getConversation] = useLazyGetConversationQuery();

  // Handle /admin/inbox/:username route without conversationId: look up or create draft
  useEffect(() => {
    if (!username || conversationId || hasLookedUpConv.current) return;
    hasLookedUpConv.current = true;

    const adminUsername = `${authUser.username}`;
    getConversation({ senderUsername: adminUsername, receiverUsername: username })
      .unwrap()
      .then((response) => {
        const conversation = (response.conversations as IConversationDocument[] | undefined)?.[0];
        if (conversation?.conversationId) {
          navigate(`/admin/inbox/${lowerCase(username)}/${conversation.conversationId}`, { replace: true });
        } else {
          const newConvId = uuidv4();
          const draft: IInboxDraftConversation = {
            seller: {
              _id: '',
              username,
              profilePicture: 'https://placehold.co/150x150?text=U',
              responseTime: 0
            },
            buyer: {
              _id: '',
              username: adminUsername,
              profilePicture: `${authUser.profilePicture || 'https://placehold.co/150x150?text=Admin'}`
            },
            conversationId: newConvId,
            gigId: '',
            hasConversationId: false,
            isAdminChat: true
          };
          navigate(`/admin/inbox/${lowerCase(username)}/${newConvId}`, {
            replace: true,
            state: { draftConversation: draft }
          });
        }
      })
      .catch(() => {
        showErrorToast('Không thể mở hộp thư.');
      });
  }, [username, conversationId, authUser.username, authUser.profilePicture, getConversation, navigate]);

  useEffect(() => {
    setSkip(false);
    setChatMessagesData([]);
  }, [conversationId]);

  useEffect(() => {
    if (isSuccess) {
      setChatMessagesData((data?.messages as IMessageDocument[]) ?? []);
    }
  }, [isSuccess, data?.messages]);

  useEffect(() => {
    if (conversationId) {
      chatMessageReceived(`${conversationId}`, chatMessagesData, chatMessages.current, setChatMessagesData);
    }
  }, [chatMessagesData, conversationId]);

  return (
    <div className="border-grey mx-2 my-5 flex max-h-[90%] flex-wrap border lg:container lg:mx-auto">
      <div className="lg:border-grey relative w-full overflow-hidden lg:w-1/3 lg:border-r">
        <ChatList />
      </div>

      <div className="relative hidden w-full overflow-hidden md:w-2/3 lg:flex">
        {conversationId && (chatMessagesData.length > 0 || activeDraftConversation || username) ? (
          <AdminChatWindow
            setSkip={setSkip}
            chatMessages={chatMessagesData}
            draftConversation={activeDraftConversation}
            isLoading={isLoading}
            isError={isError}
          />
        ) : !username ? (
          <div className="flex w-full items-center justify-center">Chọn một người dùng để trò chuyện.</div>
        ) : (
          <div className="flex w-full items-center justify-center text-gray-500">Đang tải...</div>
        )}
      </div>
    </div>
  );
};

export default AdminInbox;
