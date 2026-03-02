import { useState } from 'react';
import Navbar from '../components/Navbar';
import GameArea from '../components/GameArea';
import BetPanel from '../components/BetPanel';
import GameHistory from '../components/GameHistory';
import BetsList from '../components/BetsList';
import Chat from '../components/Chat';
import { useGameSocket } from '../hooks/useGameSocket';

export default function GamePage() {
  useGameSocket();
  const [activeTab, setActiveTab] = useState<'feed' | 'history' | 'chat'>('feed');

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#08090d] text-white flex flex-col font-sans selection:bg-indigo-500/30">
      <Navbar />

      {/* Background Ambient Glows */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/5 rounded-full blur-[120px]" />
      </div>

      <main className="flex-1 p-3 sm:p-6 max-w-[1600px] mx-auto w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">

        {/* Top Section: Dashboard Header (Optional but good for premium feel) */}
        <div className="flex justify-between items-center sm:hidden">
          <h1 className="text-xl font-black italic tracking-tighter uppercase italic">Chicken Cross</h1>
          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <span className="text-[10px] font-bold">HQ</span>
          </div>
        </div>

        {/* Main Grid: Game + Bet Panel */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 items-start">
          <div className="xl:col-span-2 order-1 h-full min-h-[400px]">
            <GameArea />
          </div>
          <div className="order-2 sticky top-6">
            <BetPanel />
          </div>
        </div>

        {/* Secondary Section: Activity / History / Chat */}
        <div className="flex-1 min-h-[300px]">
          {/* Mobile Tab Control */}
          <div className="flex p-1 gap-1 mb-4 lg:hidden glass-panel rounded-xl">
            {(['feed', 'history', 'chat'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === tab
                  ? 'bg-white/10 text-white shadow-lg'
                  : 'text-gray-500 hover:text-gray-300'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Desktop Layout: Multi-column activity feed */}
          <div className="hidden lg:grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="glass-panel rounded-2xl p-4 min-h-[400px] flex flex-col">
              <div className="flex items-center gap-2 mb-4 px-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Live Activity</h3>
              </div>
              <div className="flex-1 overflow-auto scrollbar-hide">
                <BetsList />
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-4 min-h-[400px] flex flex-col">
              <div className="flex items-center gap-2 mb-4 px-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Your History</h3>
              </div>
              <div className="flex-1 overflow-auto scrollbar-hide">
                <GameHistory />
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-4 min-h-[400px] flex flex-col">
              <div className="flex items-center gap-2 mb-4 px-2">
                <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">HQ Communications</h3>
              </div>
              <div className="flex-1 overflow-auto scrollbar-hide">
                <Chat />
              </div>
            </div>
          </div>

          {/* Mobile Tab Content */}
          <div className="lg:hidden animate-in fade-in duration-300">
            {activeTab === 'feed' && <BetsList />}
            {activeTab === 'history' && <GameHistory />}
            {activeTab === 'chat' && <Chat />}
          </div>
        </div>
      </main>

      {/* Footer / Legal Bar (Minimal) */}
      <footer className="p-6 text-center opacity-20 hover:opacity-100 transition-opacity">
        <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-gray-400">
          CHICKEN CROSS // ADVANCED GAMING PROTOCOL v1.0.4
        </p>
      </footer>
    </div>
  );
}
