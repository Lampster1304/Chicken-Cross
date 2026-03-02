import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState } from '../store';

interface AffiliateStats {
  referralCode: string;
  totalEarnings: number;
  totalReferrals: number;
  commissionRate: number;
  recentCommissions: {
    amount: number;
    referredUser: string;
    date: string;
  }[];
}

export default function AffiliatePage() {
  const token = useSelector((state: RootState) => state.auth.accessToken);
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch('/api/affiliate/stats', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const copyCode = () => {
    if (!stats) return;
    navigator.clipboard.writeText(stats.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-casino-dark text-white">
      <div className="bg-casino-card border-b border-casino-border px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-lg sm:text-xl font-bold">Affiliate Program</h1>
          <Link to="/game" className="text-casino-accent hover:underline text-sm">
            Back to Game
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : !stats ? (
          <div className="text-center py-12 text-gray-500">
            Please log in to view your affiliate stats.
          </div>
        ) : (
          <>
            {/* Referral Code */}
            <div className="bg-casino-card border border-casino-border rounded-xl p-6 text-center">
              <p className="text-gray-400 text-sm mb-2">Your Referral Code</p>
              <div className="flex items-center justify-center gap-3">
                <code className="bg-casino-darker px-6 py-3 rounded-lg border border-casino-border text-2xl font-bold text-casino-gold tracking-widest">
                  {stats.referralCode}
                </code>
                <button
                  onClick={copyCode}
                  className="bg-casino-accent hover:bg-casino-accent/80 text-white px-4 py-3 rounded-lg text-sm font-medium transition"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-gray-500 text-xs mt-3">
                Share this code with friends. You earn {stats.commissionRate}% of their bets!
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-casino-card border border-casino-border rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-casino-green">
                  ${stats.totalEarnings.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Total Earnings</p>
              </div>
              <div className="bg-casino-card border border-casino-border rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-white">{stats.totalReferrals}</p>
                <p className="text-xs text-gray-500 mt-1">Referrals</p>
              </div>
              <div className="bg-casino-card border border-casino-border rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-casino-accent">
                  {stats.commissionRate}%
                </p>
                <p className="text-xs text-gray-500 mt-1">Commission Rate</p>
              </div>
            </div>

            {/* Recent Commissions */}
            <div className="bg-casino-card border border-casino-border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-casino-border">
                <h3 className="font-bold text-sm">Recent Commissions</h3>
              </div>
              {stats.recentCommissions.length === 0 ? (
                <div className="p-6 text-center text-gray-500 text-sm">
                  No commissions yet. Share your code to start earning!
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-500 border-b border-casino-border bg-casino-darker">
                      <th className="text-left py-2 px-4">Player</th>
                      <th className="text-right py-2 px-4">Commission</th>
                      <th className="text-right py-2 px-4">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentCommissions.map((c, i) => (
                      <tr key={i} className="border-b border-casino-border/30">
                        <td className="py-2 px-4 text-white">{c.referredUser}</td>
                        <td className="py-2 px-4 text-right text-casino-green font-mono">
                          +${c.amount.toFixed(2)}
                        </td>
                        <td className="py-2 px-4 text-right text-gray-500">
                          {new Date(c.date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
