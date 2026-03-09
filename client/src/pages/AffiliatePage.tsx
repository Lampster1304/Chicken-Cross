import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState } from '../store';
import Navbar from '../components/Navbar';

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
    <div className="min-h-screen bg-gradient-to-b from-bg-primary via-bg-secondary to-bg-primary text-txt">
      <Navbar />

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-lg sm:text-xl font-bold">Programa de Afiliados</h1>
          <Link to="/game" className="text-brand hover:text-brand-light text-sm font-medium transition-colors">
            Volver al Juego
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-txt-dim">Cargando...</div>
        ) : !stats ? (
          <div className="text-center py-12 text-txt-dim">
            Inicia sesión para ver tus estadísticas de afiliado.
          </div>
        ) : (
          <>
            {/* Referral Code */}
            <div className="game-panel p-6 text-center">
              <p className="text-txt-muted text-sm mb-2">Tu Código de Referido</p>
              <div className="flex items-center justify-center gap-3">
                <code className="bg-bg-surfaceLight px-6 py-3 rounded-2xl border-2 border-brand/40 text-2xl font-bold text-brand tracking-widest" style={{ boxShadow: '0 0 20px rgba(251,191,36,0.1)' }}>
                  {stats.referralCode}
                </code>
                <button
                  onClick={copyCode}
                  className="btn-3d-primary px-4 py-3 rounded-xl text-sm"
                >
                  {copied ? '¡Copiado!' : 'Copiar'}
                </button>
              </div>
              <p className="text-txt-dim text-xs mt-3">
                ¡Comparte este código con amigos! Ganas el {stats.commissionRate}% de sus apuestas.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="game-panel p-4 text-center">
                <div className="w-8 h-8 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-2">
                  <span className="text-success text-sm">$</span>
                </div>
                <p className="text-2xl font-bold text-success">
                  ${stats.totalEarnings.toFixed(2)}
                </p>
                <p className="text-xs text-txt-dim mt-1">Ganancias Totales</p>
              </div>
              <div className="game-panel p-4 text-center">
                <div className="w-8 h-8 rounded-full bg-action-secondary/15 flex items-center justify-center mx-auto mb-2">
                  <span className="text-action-secondary text-sm">👥</span>
                </div>
                <p className="text-2xl font-bold text-txt">{stats.totalReferrals}</p>
                <p className="text-xs text-txt-dim mt-1">Referidos</p>
              </div>
              <div className="game-panel p-4 text-center">
                <div className="w-8 h-8 rounded-full bg-brand/15 flex items-center justify-center mx-auto mb-2">
                  <span className="text-brand text-sm">%</span>
                </div>
                <p className="text-2xl font-bold text-brand">
                  {stats.commissionRate}%
                </p>
                <p className="text-xs text-txt-dim mt-1">Tasa de Comisión</p>
              </div>
            </div>

            {/* Recent Commissions */}
            <div className="game-panel overflow-hidden">
              <div className="px-4 py-3 border-b border-[#3d3f7a]/40" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, transparent 100%)' }}>
                <h3 className="font-bold text-sm">Comisiones Recientes</h3>
              </div>
              {stats.recentCommissions.length === 0 ? (
                <div className="p-6 text-center text-txt-dim text-sm">
                  Sin comisiones aún. ¡Comparte tu código para empezar a ganar!
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-txt-dim border-b border-[#3d3f7a]/30">
                      <th className="text-left py-2 px-4">Jugador</th>
                      <th className="text-right py-2 px-4">Comisión</th>
                      <th className="text-right py-2 px-4">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentCommissions.map((c, i) => (
                      <tr key={i} className="border-b border-[#3d3f7a]/20 hover:bg-bg-surfaceHover transition-colors">
                        <td className="py-2 px-4 text-txt">{c.referredUser}</td>
                        <td className="py-2 px-4 text-right text-success font-mono font-semibold">
                          +${c.amount.toFixed(2)}
                        </td>
                        <td className="py-2 px-4 text-right text-txt-dim">
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
