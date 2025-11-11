import React from 'react';
import ChatbotIcon from './ChatbotIcon';

interface Chat {
  role: 'assistant' | 'user';
  text: string;
}

interface ChatMessageProps {
  chat: Chat;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ chat }) => {
  const isBot = chat.role === 'assistant';

  return (
    <div
      className={`flex items-center gap-3 ${
        isBot ? 'flex-row' : 'flex-row-reverse self-end'
      }`}
    >
      {isBot && (
        <div className="flex items-center justify-center bg-indigo-600 text-white rounded-full w-9 h-9">
          <ChatbotIcon />
        </div>
      )}
      <p
        className={`px-4 py-2 max-w-[75%] text-sm whitespace-pre-line break-words rounded-2xl ${
          isBot
            ? 'bg-indigo-50 text-gray-800 rounded-tl-none border border-indigo-100'
            : 'bg-indigo-600 text-white rounded-tr-none'
        }`}
      >
        {chat.text}
      </p>
    </div>
  );
};

export default ChatMessage;
