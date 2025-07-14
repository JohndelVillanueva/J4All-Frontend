import React, { createContext, useContext } from "react";

type ChatContextType = {
  openConversation: (conversationId: number) => void;
};

export const ChatContext = createContext<ChatContextType>({
  openConversation: () => {},
});

export const useChat = () => useContext(ChatContext); 