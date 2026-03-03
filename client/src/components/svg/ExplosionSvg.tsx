interface ExplosionSvgProps {
  className?: string;
}

export default function ExplosionSvg({ className = '' }: ExplosionSvgProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} style={{ width: '100%', height: '100%' }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="explosion-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="35%" stopColor="#f97316" />
          <stop offset="70%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#991b1b" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Outer spikes */}
      <polygon
        points="32,2 36,18 48,4 40,20 60,12 42,24 62,32 42,36 60,52 38,40 48,60 36,42 32,62 28,42 16,60 26,40 4,52 22,36 2,32 22,24 4,12 24,20 16,4 28,18"
        fill="#ef4444"
        opacity="0.9"
      />

      {/* Middle layer */}
      <polygon
        points="32,8 35,20 44,10 39,22 54,18 41,26 56,32 41,36 54,46 37,38 44,54 35,42 32,56 29,42 20,54 27,38 10,46 23,36 8,32 23,26 10,18 25,22 20,10 29,20"
        fill="#f97316"
        opacity="0.95"
      />

      {/* Inner glow */}
      <circle cx="32" cy="32" r="14" fill="url(#explosion-grad)" />

      {/* Hot center */}
      <circle cx="32" cy="32" r="7" fill="#fef9c3" opacity="0.9" />
      <circle cx="32" cy="32" r="4" fill="white" opacity="0.7" />

      {/* Sparks */}
      <circle cx="18" cy="14" r="1.5" fill="#fef08a" opacity="0.8" />
      <circle cx="48" cy="10" r="1" fill="#fef08a" opacity="0.7" />
      <circle cx="52" cy="48" r="1.5" fill="#fef08a" opacity="0.6" />
      <circle cx="12" cy="46" r="1" fill="#fef08a" opacity="0.7" />
      <circle cx="8" cy="24" r="1.2" fill="#fbbf24" opacity="0.5" />
      <circle cx="56" cy="28" r="1.2" fill="#fbbf24" opacity="0.5" />
    </svg>
  );
}
