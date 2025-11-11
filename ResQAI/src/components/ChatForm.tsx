import React, { useRef, FormEvent } from 'react';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

interface ChatFormProps {
  chatHistory: ChatMessage[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  generateBotResponse: (history: ChatMessage[]) => void;
}

const ChatForm: React.FC<ChatFormProps> = ({ 
  chatHistory, 
  setChatHistory, 
  generateBotResponse 
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    const userMessage = inputRef.current?.value.trim();
    if (!userMessage) return;
    if (inputRef.current) inputRef.current.value = "";

    // Add user message
    setChatHistory((history) => [...history, { role: "user", text: userMessage }]);

    // Add "Thinking..." and trigger bot response
    setTimeout(() => {
      setChatHistory((history) => [...history, { role: "assistant", text: "Thinking..." }]);
      generateBotResponse([...chatHistory, { role: "user", text: userMessage }]);
    }, 600);
  };

  return (
    <form
      action="#"
      onSubmit={handleFormSubmit}
      className="flex items-center bg-white rounded-full shadow-md border border-gray-300 focus-within:border-[#6D4FC2] focus-within:ring-2 focus-within:ring-[#6D4FC2]/70 px-3 py-2"
    >
      <input
        ref={inputRef}
        type="text"
        placeholder="Message..."
        required
        className="w-full h-[47px] px-3 text-[0.95rem] bg-transparent border-none outline-none text-gray-800 placeholder-gray-400"
      />

      <button
        type="submit"
        className="hidden group-valid:block bg-[#6D4FC2] hover:bg-[#593bab] text-white rounded-full w-[35px] h-[35px] flex-shrink-0 flex items-center justify-center transition-all duration-200"
      >
        <span className="material-symbols-outlined text-[1.15rem]">arrow_upward</span>
      </button>
    </form>
  );
};

export default ChatForm;
