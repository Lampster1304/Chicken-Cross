import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState } from '../store';

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
    <div className="min-h-screen bg-surface text-white">
      <div className="bg-surface-50 border-b border-surface-200/50 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-lg sm:text-xl font-bold">VIP Program</h1>
          <Link to="/game" className="text-brand hover:underline text-sm">
            Back to Game
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Current Status */}
        <div className="bg-surface-50 border border-surface-200/50 rounded-xl p-6 text-center">
          <p className="text-gray-400 text-sm mb-2">Your VIP Level</p>
          <h2
            className="text-3xl font-bold mb-1"
            style={{ color: currentTier.color }}
          >
            {currentTier.name}
          </h2>
          <p className="text-gray-400 text-sm">
            Rakeback: <span className="text-white font-bold">{currentTier.rakebackRate}%</span>
          </p>

          {nextTier && (
            <div className="mt-6 max-w-md mx-auto">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>${totalWagered.toLocaleString()} wagered</span>
                <span>${nextTier.minWagered.toLocaleString()} for {nextTier.name}</span>
              </div>
              <div className="w-full bg-surfaceer rounded-full h-3 border border-surface-200/50">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(progressToNext, 100)}%`,
                    backgroundColor: nextTier.color,
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                ${(nextTier.minWagered - totalWagered).toLocaleString()} more to go
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
                className={`bg-surface-50 border rounded-xl p-4 flex items-center justify-between transition ${
                  isCurrentTier
                    ? 'border-casino-accent shadow-lg shadow-casino-accent/10'
                    : 'border-surface-200/50'
                } ${!isUnlocked ? 'opacity-50' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                    style={{
                      backgroundColor: tier.color + '22',
                      color: tier.color,
                      border: `2px solid ${tier.color}`,
                    }}
                  >
                    {tier.name[0]}
                  </div>
                  <div>
                    <p className="font-bold" style={{ color: tier.color }}>
                      {tier.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {tier.minWagered === 0
                        ? 'Starting tier'
                        : `$${tier.minWagered.toLocaleString()} wagered`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-accent-green">{tier.rakebackRate}%</p>
                  <p className="text-xs text-gray-500">Rakeback</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
