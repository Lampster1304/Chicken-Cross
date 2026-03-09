import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { ShieldCheck, Hash, Eye, CheckCircle, Copy, Check } from 'lucide-react';

const STEPS = [
  { num: 1, text: 'Antes de que comience el juego, el servidor genera una semilla aleatoria y te envía su hash SHA-256.' },
  { num: 2, text: 'Tu cliente genera una semilla de cliente. Junto con un nonce, estos forman la entrada para cada carril.' },
  { num: 3, text: 'El resultado de cada carril se calcula como HMAC-SHA256(server_seed, "client_seed:nonce:lane").' },
  { num: 4, text: 'Cuando termina el juego, el servidor revela la semilla original.' },
  { num: 5, text: 'Puedes verificar que el hash coincida y recalcular el resultado de cada carril independientemente.' },
];

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
      {/* What is Provably Fair */}
      <Section icon={ShieldCheck} title="¿Qué es Verificablemente Justo?">
        <p className="text-[13px]">
          Verificablemente justo significa que puedes <span className="text-txt font-medium">verificar matemáticamente</span> que cada resultado del juego fue determinado antes de que apostaras y no fue manipulado. No se necesita confianza — solo matemáticas.
        </p>
      </Section>

      {/* How It Works */}
      <Section icon={Hash} title="Cómo Funciona">
        <div className="space-y-2.5">
          {STEPS.map(s => (
            <div key={s.num} className="flex gap-2.5">
              <span className="shrink-0 w-5 h-5 rounded-full bg-action-secondary/15 text-action-secondary text-[10px] font-bold flex items-center justify-center mt-0.5">
                {s.num}
              </span>
              <p className="text-[12px] leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </Section>

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

      {/* Verify */}
      <Section icon={CheckCircle} title="Verificar Resultados">
        <p className="text-[13px]">
          Después de cada juego, recibes la semilla del servidor. Para verificar:
        </p>
        <ol className="list-decimal list-inside space-y-1 mt-2 text-[12px]">
          <li>Confirma que <span className="text-txt font-medium">SHA-256(server_seed)</span> coincida con el hash mostrado antes del juego.</li>
          <li>Para cada carril, calcula <span className="font-mono text-action-primary">HMAC-SHA256(server_seed, "client_seed:nonce:lane")</span>.</li>
          <li>Convierte los primeros 8 caracteres hex a un número y compara con el umbral de dificultad.</li>
        </ol>
        <p className="text-[11px] text-txt-dim mt-2">
          Cada carril se determina independientemente — el servidor no puede cambiar los resultados después de que el juego comienza.
        </p>
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
