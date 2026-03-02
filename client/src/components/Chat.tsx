import { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { getSocket } from '../hooks/useGameSocket';

interface ChatMessage {
  id: number;
  username: string;
  message: string;
  timestamp: number;
  type: 'message' | 'system' | 'win';
}

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [canSend, setCanSend] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleMessage = (msg: ChatMessage) => {
      setMessages(prev => [...prev.slice(-99), msg]);
    };

    const handleBigWin = (data: { username: string; multiplier: number; profit: number }) => {
      setMessages(prev => [
        ...prev.slice(-99),
        {
          id: Date.now(),
          username: 'System',
          message: `${data.username} won $${data.profit.toFixed(2)} at ${data.multiplier.toFixed(2)}x!`,
          timestamp: Date.now(),
          type: 'win',
        },
      ]);
    };

    socket.on('chat:message', handleMessage);
    socket.on('chat:bigwin', handleBigWin);

    return () => {
      socket.off('chat:message', handleMessage);
      socket.off('chat:bigwin', handleBigWin);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !canSend) return;
    const socket = getSocket();
    if (!socket) return;

    socket.emit('chat:send', { message: input.trim().slice(0, 200) });
    setInput('');
    setCanSend(false);
    setTimeout(() => setCanSend(true), 3000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="bg-casino-card border border-casino-border rounded-xl p-3 sm:p-4 flex flex-col h-[300px] lg:h-full lg:min-h-[300px]">
      <h3 className="text-gray-400 text-xs sm:text-sm font-bold mb-2">Chat</h3>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-1.5 mb-2 pr-1 scrollbar-thin">
        {messages.length === 0 && (
          <p className="text-gray-600 text-xs text-center py-8">
            No messages yet. Say hi!
          </p>
        )}
        {messages.map(msg => (
          <div key={msg.id} className="text-xs sm:text-sm">
            {msg.type === 'win' ? (
              <p className="text-casino-gold bg-yellow-900/20 px-2 py-1 rounded text-xs">
                🏆 {msg.message}
              </p>
            ) : msg.type === 'system' ? (
              <p className="text-gray-500 italic text-xs">{msg.message}</p>
            ) : (
              <p>
                <span className="text-casino-accent font-medium">{msg.username}: </span>
                <span className="text-gray-300">{msg.message}</span>
              </p>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          maxLength={200}
          className="flex-1 bg-casino-darker border border-casino-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-casino-accent min-h-[44px]"
        />
        <button
          onClick={sendMessage}
          disabled={!canSend || !input.trim()}
          className="bg-casino-accent hover:bg-red-600 active:bg-red-700 text-white px-3 sm:px-4 rounded-lg text-sm font-medium transition disabled:opacity-40 min-h-[44px] min-w-[44px]"
        >
          Send
        </button>
      </div>
    </div>
  );
}
