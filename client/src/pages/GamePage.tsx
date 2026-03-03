import { useState } from 'react';
import Navbar from '../components/Navbar';
import GameArea from '../components/GameArea';
import BetPanel from '../components/BetPanel';
import GameHistory from '../components/GameHistory';
import BetsList from '../components/BetsList';
import Chat from '../components/Chat';
import { useGameSocket } from '../hooks/useGameSocket';
import { Radio, History, MessageCircle } from 'lucide-react';

const TABS = [
  { key: 'feed' as const, label: 'Live', icon: Radio },
  { key: 'history' as const, label: 'History', icon: History },
  { key: 'chat' as const, label: 'Chat', icon: MessageCircle },
];

export default function GamePage() {
  useGameSocket();
  const [activeTab, setActiveTab] = useState<'feed' | 'history' | 'chat'>('feed');

  return (
    <div className="min-h-screen min-h-[100dvh] bg-surface text-txt flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 p-3 sm:p-5 lg:p-6 max-w-[1600px] mx-auto w-full flex flex-col gap-5">
        {/* Game + Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px] gap-4 items-start">
          <div className="h-full min-h-[400px]">
            <GameArea />
          </div>
          <div className="lg:sticky lg:top-[72px]">
            <BetPanel />
          </div>
        </div>

        {/* Bottom Panels */}
        <div>
          {/* Mobile tabs */}
          <div className="flex bg-surface-50 rounded-xl p-1 gap-0.5 mb-4 lg:hidden border border-surface-200/50">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-all ${active ? 'bg-surface-200 text-brand shadow-sm' : 'text-txt-muted hover:text-txt'
                    }`}
                >
                  <Icon size={13} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Desktop 3-col */}
          <div className="hidden lg:grid lg:grid-cols-3 gap-4">
            <Panel title="Live Feed" icon={Radio} live>
              <BetsList />
            </Panel>
            <Panel title="Your History" icon={History}>
              <GameHistory />
            </Panel>
            <Panel title="Chat" icon={MessageCircle}>
              <Chat />
            </Panel>
          </div>

          {/* Mobile content */}
          <div className="lg:hidden">
            {activeTab === 'feed' && <Panel title="Live Feed" icon={Radio} live><BetsList /></Panel>}
            {activeTab === 'history' && <Panel title="Your History" icon={History}><GameHistory /></Panel>}
            {activeTab === 'chat' && <Panel title="Chat" icon={MessageCircle}><Chat /></Panel>}
          </div>
        </div>
      </main>

      <footer className="py-3 text-center">
        <p className="text-[10px] text-txt-dim font-medium">
          Chicken Cross · Provably Fair
        </p>
      </footer>
    </div>
  );
}

function Panel({
  title,
  icon: Icon,
  live,
  children,
}: {
  title: string;
  icon: React.ElementType;
  live?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface-50 border border-surface-200/50 rounded-2xl overflow-hidden flex flex-col min-h-[320px]">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-surface-200/40">
        <Icon size={13} className="text-txt-dim" />
        <span className="text-[13px] font-medium text-txt-muted">{title}</span>
        {live && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />}
      </div>
      <div className="flex-1 overflow-auto p-3">{children}</div>
    </div>
  );
}
