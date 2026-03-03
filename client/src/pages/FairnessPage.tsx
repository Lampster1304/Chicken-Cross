import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createHash, isLaneDangerous, isSafeZone, getLaneMultiplier } from '../utils/crypto';

interface GameRecord {
  id: number;
  server_seed: string;
  hashed_server_seed: string;
  client_seed: string;
  nonce: number;
  difficulty: number;
  car_positions: number[];
  bet_amount: string;
  current_lane: number;
  final_multiplier: string | null;
  profit: string | null;
  status: string;
  started_at: string;
}

interface LaneResult {
  lane: number;
  hasCar: boolean;
  isSafeZone: boolean;
}

interface VerifyResult {
  lanes: LaneResult[];
  hashedSeed: string;
  laneMultiplier: number;
}

export default function FairnessPage() {
  const [serverSeed, setServerSeed] = useState('');
  const [clientSeed, setClientSeed] = useState('');
  const [nonce, setNonce] = useState('');
  const [difficulty, setDifficulty] = useState('1');
  const [lanesToCheck, setLanesToCheck] = useState('15');
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [history, setHistory] = useState<GameRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    fetch('/api/games/history')
      .then(res => res.json())
      .then(data => setHistory(data.games || []))
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  }, []);

  const verify = async () => {
    if (!serverSeed || !clientSeed || nonce === '' || !difficulty) return;

    const nonceNum = parseInt(nonce);
    const diffNum = parseInt(difficulty);
    const numLanes = parseInt(lanesToCheck) || 15;
    if (isNaN(nonceNum) || isNaN(diffNum) || diffNum < 1 || diffNum > 4) return;

    const lanes: LaneResult[] = [];
    for (let lane = 1; lane <= numLanes; lane++) {
      const safe = isSafeZone(lane);
      const hasCar = safe ? false : await isLaneDangerous(serverSeed, clientSeed, nonceNum, lane, diffNum);
      lanes.push({ lane, hasCar, isSafeZone: safe });
    }

    const hashedSeed = await createHash(serverSeed);
    const laneMultiplier = getLaneMultiplier(diffNum);

    setResult({ lanes, hashedSeed, laneMultiplier });
  };

  const fillFromHistory = (game: GameRecord) => {
    setServerSeed(game.server_seed);
    setClientSeed(game.client_seed);
    setNonce(game.nonce.toString());
    setDifficulty(game.difficulty.toString());
    setLanesToCheck(Math.max(game.current_lane + 5, 15).toString());
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-surface text-white">
      {/* Header */}
      <div className="bg-surface-50 border-b border-surface-200/50 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-lg sm:text-xl font-bold">Provably Fair</h1>
          <Link to="/game" className="text-brand hover:underline text-sm">
            Back to Game
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Explanation */}
        <div className="bg-surface-50 border border-surface-200/50 rounded-xl p-4 sm:p-6">
          <h2 className="text-lg font-bold mb-3">How it works</h2>
          <div className="text-gray-400 text-sm space-y-2">
            <p>Every lane in Chicken Cross is provably fair. Each lane outcome is determined independently using cryptographic hashing.</p>
            <p><strong className="text-white">1.</strong> A <span className="text-brand">server seed</span> is generated and its SHA-256 hash is shown before you play.</p>
            <p><strong className="text-white">2.</strong> Each lane result: <code className="bg-surfaceer px-1 rounded">HMAC-SHA256(server_seed, client_seed:nonce:lane)</code> → roll % 100. If roll &lt; difficulty*20 → car.</p>
            <p><strong className="text-white">3.</strong> Every 5th lane is a guaranteed safe zone (no hash check needed).</p>
            <p><strong className="text-white">4.</strong> After the game, the server seed is revealed so you can verify every lane.</p>
            <p><strong className="text-white">5.</strong> House edge: 3% (applied to multipliers).</p>
          </div>
        </div>

        {/* Verification tool */}
        <div className="bg-surface-50 border border-surface-200/50 rounded-xl p-4 sm:p-6">
          <h2 className="text-lg font-bold mb-4">Verify a Game</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Server Seed</label>
              <input
                type="text"
                value={serverSeed}
                onChange={e => setServerSeed(e.target.value)}
                placeholder="Enter server seed..."
                className="w-full bg-surfaceer border border-surface-200/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand/50 font-mono"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Client Seed</label>
                <input
                  type="text"
                  value={clientSeed}
                  onChange={e => setClientSeed(e.target.value)}
                  placeholder="client seed"
                  className="w-full bg-surfaceer border border-surface-200/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand/50 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Nonce</label>
                <input
                  type="number"
                  value={nonce}
                  onChange={e => setNonce(e.target.value)}
                  placeholder="0"
                  className="w-full bg-surfaceer border border-surface-200/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand/50 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value)}
                  className="w-full bg-surfaceer border border-surface-200/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand/50"
                >
                  <option value="1">1 (Easy)</option>
                  <option value="2">2 (Medium)</option>
                  <option value="3">3 (Hard)</option>
                  <option value="4">4 (Extreme)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Lanes to check</label>
                <input
                  type="number"
                  value={lanesToCheck}
                  onChange={e => setLanesToCheck(e.target.value)}
                  min="5"
                  max="100"
                  className="w-full bg-surfaceer border border-surface-200/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand/50 font-mono"
                />
              </div>
            </div>
            <button
              onClick={verify}
              className="w-full sm:w-auto bg-brand hover:bg-red-600 text-white font-bold px-6 py-3 rounded-lg transition min-h-[48px]"
            >
              Verify
            </button>
          </div>

          {result && (
            <div className="mt-4 bg-surfaceer border border-surface-200/50 rounded-lg p-4 space-y-3">
              <div>
                <span className="text-gray-400 text-sm">
                  Per-lane multiplier: <span className="text-accent-green font-bold font-mono">{result.laneMultiplier.toFixed(2)}x</span>
                </span>
              </div>

              {/* Lane results */}
              <div>
                <span className="text-gray-400 text-sm">Lane outcomes:</span>
                <div className="flex gap-1 mt-2 flex-wrap">
                  {result.lanes.map(l => (
                    <div
                      key={l.lane}
                      className={`w-10 h-10 rounded flex items-center justify-center text-xs font-bold border ${
                        l.isSafeZone
                          ? 'bg-green-900/40 text-green-400 border-green-500/40'
                          : l.hasCar
                            ? 'bg-red-900/50 text-red-400 border-red-500/40'
                            : 'bg-gray-800/50 text-gray-300 border-gray-600/30'
                      }`}
                      title={`Lane ${l.lane}${l.isSafeZone ? ' (Safe Zone)' : l.hasCar ? ' (Car!)' : ' (Safe)'}`}
                    >
                      {l.isSafeZone ? '🌿' : l.hasCar ? '🚗' : l.lane}
                    </div>
                  ))}
                </div>
              </div>

              {/* Hashed seed */}
              <div>
                <span className="text-gray-400 text-xs">Hashed Server Seed (SHA-256):</span>
                <p className="text-xs font-mono text-gray-300 break-all mt-1 select-all">{result.hashedSeed}</p>
              </div>
            </div>
          )}
        </div>

        {/* Game history */}
        <div className="bg-surface-50 border border-surface-200/50 rounded-xl p-4 sm:p-6">
          <h2 className="text-lg font-bold mb-4">Recent Games</h2>
          {loadingHistory ? (
            <p className="text-gray-500 text-sm">Loading...</p>
          ) : history.length === 0 ? (
            <p className="text-gray-500 text-sm">No games yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="text-gray-500 border-b border-surface-200/50">
                    <th className="text-left py-2 px-2">Game</th>
                    <th className="text-center py-2 px-2">Difficulty</th>
                    <th className="text-center py-2 px-2">Lanes</th>
                    <th className="text-right py-2 px-2">Result</th>
                    <th className="text-right py-2 px-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {history.slice(0, 20).map(game => {
                    const isWin = game.status === 'cashed_out' || game.status === 'completed';
                    const mult = game.final_multiplier ? parseFloat(game.final_multiplier) : null;

                    return (
                      <tr key={game.id} className="border-b border-surface-200/50/30">
                        <td className="py-2 px-2 text-gray-400">#{game.id}</td>
                        <td className="py-2 px-2 text-center">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            game.difficulty === 1 ? 'bg-green-900/40 text-green-400' :
                            game.difficulty === 2 ? 'bg-yellow-900/40 text-yellow-400' :
                            game.difficulty === 3 ? 'bg-orange-900/40 text-orange-400' :
                            'bg-red-900/40 text-red-400'
                          }`}>
                            {game.difficulty}🚗
                          </span>
                        </td>
                        <td className="py-2 px-2 text-center text-gray-400 font-mono text-xs">
                          L{game.current_lane}
                        </td>
                        <td className="py-2 px-2 text-right font-mono font-bold">
                          {isWin ? (
                            <span className="text-accent-green">{mult?.toFixed(2)}x</span>
                          ) : (
                            <span className="text-brand">Hit L{game.current_lane}</span>
                          )}
                        </td>
                        <td className="py-2 px-2 text-right">
                          <button
                            onClick={() => fillFromHistory(game)}
                            className="text-brand hover:underline text-xs"
                          >
                            Verify
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
