import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { ShieldCheck, Hash, Eye, CheckCircle, Copy, Check } from 'lucide-react';

export default function GameFairness() {
  const { activeGame, lastResult } = useSelector((state: RootState) => state.game);
  const [copied, setCopied] = useState<string | null>(null);

  const hashedSeed = activeGame?.hashedServerSeed;
  const revealedSeed = lastResult?.serverSeed;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  return (
    <div className="space-y-5 text-sm text-txt-muted">
      {/* Game Seeds */}
      <Section icon={Eye} title="Semillas del Juego">
        {!hashedSeed && !revealedSeed ? (
          <p className="text-[12px] text-txt-dim">Inicia un juego para ver información de semillas.</p>
        ) : (
          <div className="space-y-2.5">
            {hashedSeed && (
              <SeedRow
                label="Semilla del Servidor (Hash)"
                value={hashedSeed}
                copied={copied === 'hashed'}
                onCopy={() => copyToClipboard(hashedSeed, 'hashed')}
              />
            )}
            {revealedSeed && (
              <SeedRow
                label="Semilla del Servidor (Revelada)"
                value={revealedSeed}
                copied={copied === 'revealed'}
                onCopy={() => copyToClipboard(revealedSeed, 'revealed')}
              />
            )}
          </div>
        )}
      </Section>
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className="text-action-secondary" />
        <h3 className="text-[13px] font-semibold text-txt">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function SeedRow({ label, value, copied, onCopy }: { label: string; value: string; copied: boolean; onCopy: () => void }) {
  return (
    <div className="bg-bg-surfaceHover rounded-xl px-3 py-2.5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-txt-dim font-medium">{label}</span>
        <button onClick={onCopy} className="text-txt-dim hover:text-action-primary transition-colors">
          {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
        </button>
      </div>
      <p className="font-mono text-[10px] text-txt break-all leading-relaxed">{value}</p>
    </div>
  );
}
