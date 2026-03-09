import { Footprints, TrendingUp } from 'lucide-react';

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



      {/* Multipliers */}
      <Section icon={TrendingUp} title="Multiplicadores">
        <p className="text-[13px]">
          Tu multiplicador se acumula con cada <span className="text-txt font-medium">carril arriesgado</span> que cruzas exitosamente.
        </p>
        <p className="text-[12px] text-txt-dim mt-2 leading-relaxed">
          Cada carril superado aumenta tu multiplicador actual según el nivel de dificultad global. A mayor riesgo, recompensas exponencialmente mayores.
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
