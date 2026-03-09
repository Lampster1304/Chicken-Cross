import { Footprints, Gauge, TrendingUp } from 'lucide-react';

const DIFFICULTY_TABLE = [
  { level: 'Fácil', cars: '20%', mult: '1.21×', color: 'text-emerald-400', dot: 'bg-emerald-400' },
  { level: 'Medio', cars: '40%', mult: '1.61×', color: 'text-amber-400', dot: 'bg-amber-400' },
  { level: 'Difícil', cars: '60%', mult: '2.42×', color: 'text-orange-400', dot: 'bg-orange-400' },
  { level: 'Extremo', cars: '80%', mult: '4.85×', color: 'text-red-400', dot: 'bg-red-400' },
];

export default function GameDescription() {
  return (
    <div className="space-y-5 text-sm text-txt-muted">
      {/* How to Play */}
      <Section icon={Footprints} title="Cómo Jugar">
        <ol className="list-decimal list-inside space-y-1.5 text-[13px]">
          <li>Establece tu <span className="text-txt font-medium">monto de apuesta</span>.</li>
          <li>Presiona <span className="text-action-primary font-medium">Apostar</span> para comenzar a cruzar.</li>
          <li>Cada carril que cruzas <span className="text-txt font-medium">aumenta tu multiplicador</span>.</li>
          <li>Presiona <span className="text-success font-medium">Cobrar</span> en cualquier momento para cobrar tus ganancias.</li>
          <li>Si un auto te choca, <span className="text-danger font-medium">pierdes tu apuesta</span>.</li>
        </ol>
      </Section>

      {/* Difficulty Levels */}
      <Section icon={Gauge} title="Niveles de Dificultad">
        <div className="rounded-xl border border-[#3d3f7a]/40 overflow-hidden">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="bg-bg-surfaceHover text-txt-dim">
                <th className="text-left py-2 px-3 font-medium">Nivel</th>
                <th className="text-center py-2 px-3 font-medium">Prob. Auto</th>
                <th className="text-right py-2 px-3 font-medium">Por Carril</th>
              </tr>
            </thead>
            <tbody>
              {DIFFICULTY_TABLE.map(d => (
                <tr key={d.level} className="border-t border-[#3d3f7a]/30">
                  <td className="py-2 px-3">
                    <span className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${d.dot}`} />
                      <span className={d.color}>{d.level}</span>
                    </span>
                  </td>
                  <td className="py-2 px-3 text-center text-txt-dim font-mono">{d.cars}</td>
                  <td className="py-2 px-3 text-right text-txt font-mono font-semibold">{d.mult}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Multipliers */}
      <Section icon={TrendingUp} title="Multiplicadores">
        <p className="text-[13px]">
          Tu multiplicador se acumula con cada <span className="text-txt font-medium">carril arriesgado</span> que cruzas exitosamente. La fórmula es:
        </p>
        <div className="mt-2 bg-bg-surfaceHover rounded-xl px-3 py-2.5 font-mono text-[12px] text-action-primary">
          multiplicador = (0.97 / P(seguro)) ^ carriles_arriesgados_cruzados
        </div>
        <p className="text-[12px] text-txt-dim mt-2">
          El factor 0.97 representa un 3% de ventaja de la casa. Mayor dificultad = mayor riesgo, pero recompensas exponencialmente mayores.
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
