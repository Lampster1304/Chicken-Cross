interface BarrierSvgProps {
  side?: 'left' | 'right';
  className?: string;
}

export default function BarrierSvg({ side = 'left', className = '' }: BarrierSvgProps) {
  return (
    <svg
      viewBox="0 0 40 48"
      className={className}
      style={{
        width: '100%',
        height: '100%',
        transform: side === 'right' ? 'scaleX(-1)' : undefined,
      }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Base plate */}
      <rect x="8" y="44" width="12" height="4" rx="1" fill="#4a4a5a" />
      <rect x="9" y="45" width="10" height="2" rx="0.5" fill="#5a5a6a" opacity="0.5" />

      {/* Vertical post */}
      <rect x="12" y="10" width="4" height="34" rx="1" fill="#4a4a5a" />
      <rect x="13" y="10" width="1.5" height="34" rx="0.5" fill="#5a5a6a" opacity="0.3" />

      {/* Warning light (yellow) */}
      <circle cx="14" cy="8" r="4" fill="#333" />
      <circle cx="14" cy="8" r="3" fill="#fbbf24" />
      <circle cx="14" cy="8" r="2" fill="#fef08a" opacity="0.8" />
      <circle cx="13.2" cy="7" r="0.8" fill="white" opacity="0.5" />
      {/* Light glow */}
      <circle cx="14" cy="8" r="5" fill="#fbbf24" opacity="0.15" />

      {/* Pivot joint */}
      <circle cx="14" cy="14" r="3" fill="#555" />
      <circle cx="14" cy="14" r="2" fill="#666" />
      <circle cx="14" cy="14" r="1" fill="#888" />

      {/* Barrier arm (horizontal with diagonal red/white stripes) */}
      <defs>
        <pattern id="barrier-stripes" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
          <rect width="3" height="6" fill="#ef4444" />
          <rect x="3" width="3" height="6" fill="white" />
        </pattern>
        <clipPath id="arm-clip">
          <rect x="14" y="12" width="24" height="4" rx="1.5" />
        </clipPath>
      </defs>

      {/* Arm shadow */}
      <rect x="14" y="13" width="24" height="4" rx="1.5" fill="rgba(0,0,0,0.2)" />

      {/* Arm with stripes */}
      <g clipPath="url(#arm-clip)">
        <rect x="14" y="12" width="24" height="4" fill="url(#barrier-stripes)" />
      </g>

      {/* Arm border/outline */}
      <rect x="14" y="12" width="24" height="4" rx="1.5" fill="none" stroke="#b91c1c" strokeWidth="0.5" opacity="0.4" />

      {/* Arm end cap */}
      <circle cx="37" cy="14" r="2" fill="#ef4444" />
      <circle cx="37" cy="14" r="1" fill="#fca5a5" opacity="0.5" />

      {/* Reflective dots on arm */}
      <circle cx="22" cy="14" r="0.8" fill="white" opacity="0.4" />
      <circle cx="30" cy="14" r="0.8" fill="white" opacity="0.4" />
    </svg>
  );
}
