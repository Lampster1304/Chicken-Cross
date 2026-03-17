import { useState } from 'react';
import Navbar from '../components/Navbar';
import GameArea from '../components/GameArea';
import BetPanel from '../components/BetPanel';
import GameHistory from '../components/GameHistory';
import BetsList from '../components/BetsList';
import GameDescription from '../components/GameDescription';
import { useGameSocket } from '../hooks/useGameSocket';
import { Radio, History, Info } from 'lucide-react';

type TabKey = 'feed' | 'history' | 'description';

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: 'feed', label: 'En Vivo', icon: Radio },
  { key: 'history', label: 'Historial', icon: History },
  { key: 'description', label: 'Reglas', icon: Info },
];

export default function GamePage() {
  useGameSocket();
  const [activeTab, setActiveTab] = useState<TabKey>('feed');

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gradient-to-b from-bg-primary via-bg-secondary to-bg-primary text-txt flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 p-3 sm:p-5 lg:p-6 max-w-[1600px] mx-auto w-full flex flex-col gap-5">
        {/* Game + Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px] gap-4 items-start">
          <div className="h-full min-h-[480px] sm:min-h-[500px] lg:min-h-[400px] isolate">
            <GameArea />
          </div>
          <div className="lg:sticky lg:top-[72px]">
            <BetPanel />
          </div>
        </div>

        {/* Bottom Panels */}
        <div>
          {/* Mobile tabs */}
          <div className="flex bg-bg-surface rounded-2xl p-1 gap-0.5 mb-4 lg:hidden border border-[#3d3f7a]/50">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl text-[10px] sm:text-xs font-medium transition-all ${active ? 'bg-action-primary text-bg-primary shadow-sm font-bold' : 'text-txt-muted hover:text-txt'
                    }`}
                >
                  <Icon size={12} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Desktop/Tablet: first row 2-col (Live, History) */}
          <div className="hidden lg:grid lg:grid-cols-2 gap-4">
            <Panel title="En Vivo" icon={Radio} live>
              <BetsList />
            </Panel>
            <Panel title="Tu Historial" icon={History}>
              <GameHistory />
            </Panel>
          </div>

          {/* Desktop/Tablet: second row (Rules) */}
          <div className="hidden lg:block mt-4">
            <Panel title="Reglas del Juego" icon={Info}>
              <GameDescription />
            </Panel>
          </div>

          {/* Mobile content */}
          <div className="lg:hidden">
            {activeTab === 'feed' && <Panel title="En Vivo" icon={Radio} live><BetsList /></Panel>}
            {activeTab === 'history' && <Panel title="Tu Historial" icon={History}><GameHistory /></Panel>}
            {activeTab === 'description' && <Panel title="Reglas del Juego" icon={Info}><GameDescription /></Panel>}
          </div>
        </div>
      </main>

      <footer className="py-3 text-center">
        <p className="text-[10px] text-txt-muted font-medium">
          Chicken Cross · Verificablemente Justo
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
    <div className="game-panel overflow-hidden flex flex-col min-h-[320px]">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#3d3f7a]/40" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, transparent 100%)' }}>
        <Icon size={13} className="text-action-secondary" />
        <span className="text-[13px] font-medium text-txt-muted">{title}</span>
        {live && <span className="ml-auto w-2 h-2 rounded-full bg-success shadow-[0_0_8px_#2dd4bf] animate-pulse" />}
      </div>
      <div className="flex-1 overflow-auto p-3">{children}</div>
    </div>
  );
}
