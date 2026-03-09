import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState } from '../store';
import Navbar from '../components/Navbar';

interface VipTier {
  name: string;
  minWagered: number;
  rakebackRate: number;
  color: string;
}

const VIP_TIERS: VipTier[] = [
  { name: 'Bronze', minWagered: 0, rakebackRate: 0, color: '#cd7f32' },
  { name: 'Silver', minWagered: 5000, rakebackRate: 0.5, color: '#c0c0c0' },
  { name: 'Gold', minWagered: 25000, rakebackRate: 1.0, color: '#ffd700' },
  { name: 'Platinum', minWagered: 100000, rakebackRate: 1.5, color: '#e5e4e2' },
  { name: 'Diamond', minWagered: 500000, rakebackRate: 2.0, color: '#b9f2ff' },
];

export default function VipPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const totalWagered = user?.totalWagered ?? 0;

  const currentTierIdx = VIP_TIERS.reduce(
    (acc, t, i) => (totalWagered >= t.minWagered ? i : acc),
    0
  );
  const currentTier = VIP_TIERS[currentTierIdx];
  const nextTier = currentTierIdx < VIP_TIERS.length - 1 ? VIP_TIERS[currentTierIdx + 1] : null;

  const progressToNext = nextTier
    ? ((totalWagered - currentTier.minWagered) / (nextTier.minWagered - currentTier.minWagered)) * 100
    : 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-primary via-bg-secondary to-bg-primary text-txt">
      <Navbar />

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-lg sm:text-xl font-bold">Programa VIP</h1>
          <Link to="/game" className="text-brand hover:text-brand-light text-sm font-medium transition-colors">
            Volver al Juego
          </Link>
        </div>

        {/* Current Status */}
        <div className="game-panel p-6 text-center">
          <p className="text-txt-muted text-sm mb-2">Tu Nivel VIP</p>
          <h2
            className="text-3xl font-bold mb-1"
            style={{ color: currentTier.color, textShadow: `0 0 20px ${currentTier.color}40` }}
          >
            {currentTier.name}
          </h2>
          <p className="text-txt-muted text-sm">
            Rakeback: <span className="text-txt font-bold">{currentTier.rakebackRate}%</span>
          </p>

          {nextTier && (
            <div className="mt-6 max-w-md mx-auto">
              <div className="flex justify-between text-xs text-txt-dim mb-1">
                <span>${totalWagered.toLocaleString()} apostado</span>
                <span>${nextTier.minWagered.toLocaleString()} para {nextTier.name}</span>
              </div>
              <div className="w-full bg-bg-surfaceLight rounded-full h-3 border border-[#3d3f7a]/40 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(progressToNext, 100)}%`,
                    background: `linear-gradient(90deg, #a3e635, #fbbf24)`,
                  }}
                />
              </div>
              <p className="text-xs text-txt-dim mt-1">
                ${(nextTier.minWagered - totalWagered).toLocaleString()} más por apostar
              </p>
            </div>
          )}
        </div>

        {/* Tier Cards */}
        <div className="grid gap-3">
          {VIP_TIERS.map((tier, i) => {
            const isCurrentTier = i === currentTierIdx;
            const isUnlocked = i <= currentTierIdx;

            return (
              <div
                key={tier.name}
                className={`game-panel p-4 flex items-center justify-between transition ${
                  isCurrentTier
                    ? ''
                    : ''
                } ${!isUnlocked ? 'opacity-50' : ''}`}
                style={{
                  borderColor: isCurrentTier ? tier.color + '60' : undefined,
                  boxShadow: isCurrentTier ? `0 0 20px ${tier.color}20, 0 8px 0 0 #13142e` : undefined,
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                    style={{
                      backgroundColor: tier.color + '22',
                      color: tier.color,
                      border: `2px solid ${tier.color}`,
                      boxShadow: isCurrentTier ? `0 0 12px ${tier.color}40` : undefined,
                    }}
                  >
                    {tier.name[0]}
                  </div>
                  <div>
                    <p className="font-bold" style={{ color: tier.color }}>
                      {tier.name}
                    </p>
                    <p className="text-xs text-txt-dim">
                      {tier.minWagered === 0
                        ? 'Nivel inicial'
                        : `$${tier.minWagered.toLocaleString()} apostado`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-success">{tier.rakebackRate}%</p>
                  <p className="text-xs text-txt-dim">Rakeback</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
