import { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState } from '../store';
import { getSocket } from '../hooks/useGameSocket';
import { Send } from 'lucide-react';

interface ChatMessage {
  id: number;
  username: string;
  message: string;
  timestamp: number;
  type: 'message' | 'system' | 'win';
}

export default function Chat() {
  const { t } = useTranslation();
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
          message: t('chat.bigWin', { username: data.username, profit: data.profit.toFixed(2), multiplier: data.multiplier.toFixed(2) }),
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
  }, [t]);

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
    <div className="flex flex-col h-[280px] lg:h-full lg:min-h-[280px]">
      <div className="flex-1 overflow-y-auto space-y-1.5 mb-3 pr-1">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-txt-dim">
            <p className="text-xs">{t('chat.noMessages')}</p>
          </div>
        )}
        {messages.map(msg => (
          <div key={msg.id} className="text-[12px]">
            {msg.type === 'win' ? (
              <div className="bg-brand/10 border border-brand/20 text-brand px-3 py-1.5 rounded-xl text-[11px] font-medium flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-brand/20 flex items-center justify-center text-[8px]">★</span>
                {msg.message}
              </div>
            ) : msg.type === 'system' ? (
              <p className="text-txt-dim italic text-[11px] px-1">{msg.message}</p>
            ) : (
              <div className="px-2 py-1 rounded-lg hover:bg-bg-surfaceHover/50 transition-colors">
                <span className="text-action-secondary font-semibold">{msg.username}</span>
                <span className="text-txt-dim mx-1.5">·</span>
                <span className="text-txt/70">{msg.message}</span>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2">
        <input
          type="text" value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('chat.placeholder')}
          maxLength={200}
          className="flex-1 bg-[#2f3070] border border-[#3d3f7a]/50 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-action-primary/40 transition-colors placeholder:text-txt-dim/40 min-h-[40px] focus:shadow-[0_0_12px_rgba(163,230,53,0.1)]"
        />
        <button
          onClick={sendMessage}
          disabled={!canSend || !input.trim()}
          className="btn-3d-primary p-2.5 rounded-xl min-w-[40px] flex items-center justify-center disabled:opacity-30"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
