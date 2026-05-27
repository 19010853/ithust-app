import { useCallback } from 'react';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import { generateRandomNumber, lowerCase, showErrorToast } from 'src/shared/utils/utils.service';

import { IChatBuyerProps, IChatSellerProps, IConversationDocument, IInboxDraftConversation } from '../interfaces/chat.interface';
import { useLazyGetConversationQuery } from '../services/chat.service';

interface IInboxNavigationParams {
  buyer: IChatBuyerProps;
  currentUsername: string;
  gigId: string;
  seller: IChatSellerProps;
}

interface IInboxNavigation {
  navigateToInbox: (params: IInboxNavigationParams) => Promise<void>;
}

const useInboxNavigation = (): IInboxNavigation => {
  const navigate: NavigateFunction = useNavigate();
  const [getConversation] = useLazyGetConversationQuery();

  const navigateToInbox = useCallback(
    async ({ seller, buyer, gigId, currentUsername }: IInboxNavigationParams): Promise<void> => {
      try {
        const response = await getConversation({
          senderUsername: seller.username,
          receiverUsername: buyer.username
        }).unwrap();
        const conversation = response.conversations?.[0] as IConversationDocument | undefined;
        const conversationId = conversation?.conversationId ?? `${generateRandomNumber(15)}`;
        const chatUsername = lowerCase(currentUsername) === lowerCase(seller.username) ? buyer.username : seller.username;

        if (conversation) {
          navigate(`/inbox/${lowerCase(chatUsername)}/${conversationId}`);
          return;
        }

        const draftConversation: IInboxDraftConversation = {
          buyer,
          conversationId,
          gigId,
          hasConversationId: false,
          seller
        };

        navigate(`/inbox/${lowerCase(chatUsername)}/${conversationId}`, { state: { draftConversation } });
      } catch (error) {
        showErrorToast('Unable to open inbox.');
      }
    },
    [getConversation, navigate]
  );

  return { navigateToInbox };
};

export default useInboxNavigation;
