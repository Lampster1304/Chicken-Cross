interface CarSvgProps {
  color?: string;
  direction?: 'down' | 'up';
  className?: string;
}

export default function CarSvg({ color = '#ef4444', direction = 'down', className = '' }: CarSvgProps) {
  // Derive darker shade for accents
  const darken = (hex: string, amount: number) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, (num >> 16) - amount);
    const g = Math.max(0, ((num >> 8) & 0xff) - amount);
    const b = Math.max(0, (num & 0xff) - amount);
    return `rgb(${r},${g},${b})`;
  };

  const bodyDark = darken(color, 40);

  return (
    <svg
      viewBox="0 0 40 64"
      className={className}
      style={{
        transform: direction === 'up' ? 'rotate(180deg)' : undefined,
        width: '100%',
        height: '100%',
      }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Shadow */}
      <ellipse cx="20" cy="60" rx="16" ry="3" fill="rgba(0,0,0,0.25)" />

      {/* Body */}
      <rect x="4" y="10" width="32" height="48" rx="8" ry="8" fill={color} />
      {/* Body side accent */}
      <rect x="4" y="34" width="32" height="24" rx="0" ry="0" fill={bodyDark} opacity="0.3" />
      <rect x="4" y="50" width="32" height="8" rx="0" ry="8" fill={bodyDark} opacity="0.3" />

      {/* Hood (top section) */}
      <rect x="6" y="12" width="28" height="14" rx="6" ry="6" fill={bodyDark} opacity="0.2" />

      {/* Windshield */}
      <rect x="8" y="22" width="24" height="12" rx="4" ry="4" fill="#1e293b" opacity="0.85" />
      {/* Windshield glare */}
      <rect x="10" y="24" width="10" height="3" rx="1.5" fill="white" opacity="0.25" />

      {/* Rear window */}
      <rect x="10" y="44" width="20" height="8" rx="3" ry="3" fill="#1e293b" opacity="0.7" />

      {/* Headlights */}
      <circle cx="10" cy="14" r="3" fill="#fef08a" />
      <circle cx="30" cy="14" r="3" fill="#fef08a" />
      {/* Headlight glow */}
      <circle cx="10" cy="14" r="2" fill="white" opacity="0.6" />
      <circle cx="30" cy="14" r="2" fill="white" opacity="0.6" />

      {/* Taillights */}
      <circle cx="10" cy="54" r="2.5" fill="#ef4444" />
      <circle cx="30" cy="54" r="2.5" fill="#ef4444" />
      <circle cx="10" cy="54" r="1.5" fill="#fca5a5" opacity="0.6" />
      <circle cx="30" cy="54" r="1.5" fill="#fca5a5" opacity="0.6" />

      {/* Side mirrors */}
      <ellipse cx="1" cy="26" rx="2" ry="3" fill={bodyDark} opacity="0.5" />
      <ellipse cx="39" cy="26" rx="2" ry="3" fill={bodyDark} opacity="0.5" />

      {/* Wheels */}
      <rect x="2" y="16" width="5" height="10" rx="2.5" fill="#1e1e1e" />
      <rect x="33" y="16" width="5" height="10" rx="2.5" fill="#1e1e1e" />
      <rect x="2" y="42" width="5" height="10" rx="2.5" fill="#1e1e1e" />
      <rect x="33" y="42" width="5" height="10" rx="2.5" fill="#1e1e1e" />
      {/* Wheel highlights */}
      <rect x="3" y="18" width="2" height="4" rx="1" fill="#444" />
      <rect x="35" y="18" width="2" height="4" rx="1" fill="#444" />
      <rect x="3" y="44" width="2" height="4" rx="1" fill="#444" />
      <rect x="35" y="44" width="2" height="4" rx="1" fill="#444" />

      {/* Roof line / center stripe accent */}
      <line x1="20" y1="12" x2="20" y2="18" stroke="white" strokeWidth="1" opacity="0.15" strokeLinecap="round" />
    </svg>
  );
}
