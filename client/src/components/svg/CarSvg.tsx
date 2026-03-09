interface CarSvgProps {
  color?: string;
  direction?: 'down' | 'up';
  className?: string;
  variant?: 'sedan' | 'pickup' | 'taxi' | 'sports';
}

function darken(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0xff) - amount);
  const b = Math.max(0, (num & 0xff) - amount);
  return `rgb(${r},${g},${b})`;
}

function SedanSvg({ color, bodyDark }: { color: string; bodyDark: string }) {
  return (
    <>
      <ellipse cx="20" cy="60" rx="16" ry="3" fill="rgba(0,0,0,0.25)" />
      <rect x="4" y="10" width="32" height="48" rx="8" ry="8" fill={color} />
      <rect x="4" y="34" width="32" height="24" rx="0" ry="0" fill={bodyDark} opacity="0.3" />
      <rect x="4" y="50" width="32" height="8" rx="0" ry="8" fill={bodyDark} opacity="0.3" />
      <rect x="6" y="12" width="28" height="14" rx="6" ry="6" fill={bodyDark} opacity="0.2" />
      <rect x="8" y="22" width="24" height="12" rx="4" ry="4" fill="#1e293b" opacity="0.85" />
      <rect x="10" y="24" width="10" height="3" rx="1.5" fill="white" opacity="0.25" />
      <rect x="10" y="44" width="20" height="8" rx="3" ry="3" fill="#1e293b" opacity="0.7" />
      <circle cx="10" cy="14" r="3" fill="#fef08a" />
      <circle cx="30" cy="14" r="3" fill="#fef08a" />
      <circle cx="10" cy="14" r="2" fill="white" opacity="0.6" />
      <circle cx="30" cy="14" r="2" fill="white" opacity="0.6" />
      <circle cx="10" cy="54" r="2.5" fill="#ef4444" />
      <circle cx="30" cy="54" r="2.5" fill="#ef4444" />
      <circle cx="10" cy="54" r="1.5" fill="#fca5a5" opacity="0.6" />
      <circle cx="30" cy="54" r="1.5" fill="#fca5a5" opacity="0.6" />
      <ellipse cx="1" cy="26" rx="2" ry="3" fill={bodyDark} opacity="0.5" />
      <ellipse cx="39" cy="26" rx="2" ry="3" fill={bodyDark} opacity="0.5" />
      <rect x="2" y="16" width="5" height="10" rx="2.5" fill="#1e1e1e" />
      <rect x="33" y="16" width="5" height="10" rx="2.5" fill="#1e1e1e" />
      <rect x="2" y="42" width="5" height="10" rx="2.5" fill="#1e1e1e" />
      <rect x="33" y="42" width="5" height="10" rx="2.5" fill="#1e1e1e" />
      <rect x="3" y="18" width="2" height="4" rx="1" fill="#444" />
      <rect x="35" y="18" width="2" height="4" rx="1" fill="#444" />
      <rect x="3" y="44" width="2" height="4" rx="1" fill="#444" />
      <rect x="35" y="44" width="2" height="4" rx="1" fill="#444" />
      <line x1="20" y1="12" x2="20" y2="18" stroke="white" strokeWidth="1" opacity="0.15" strokeLinecap="round" />
    </>
  );
}

function PickupSvg({ color, bodyDark }: { color: string; bodyDark: string }) {
  return (
    <>
      <ellipse cx="20" cy="62" rx="16" ry="3" fill="rgba(0,0,0,0.25)" />
      {/* Body - taller */}
      <rect x="4" y="6" width="32" height="56" rx="6" ry="6" fill={color} />
      {/* Cabin (shorter, front half) */}
      <rect x="5" y="8" width="30" height="20" rx="5" ry="5" fill={bodyDark} opacity="0.2" />
      {/* Windshield */}
      <rect x="8" y="18" width="24" height="10" rx="3" ry="3" fill="#1e293b" opacity="0.85" />
      <rect x="10" y="20" width="10" height="3" rx="1.5" fill="white" opacity="0.25" />
      {/* Open bed (rear half) */}
      <rect x="6" y="32" width="28" height="26" rx="2" ry="2" fill={bodyDark} opacity="0.35" />
      {/* Bed inner */}
      <rect x="8" y="34" width="24" height="22" rx="1" ry="1" fill={bodyDark} opacity="0.2" />
      {/* Bed rails */}
      <rect x="6" y="32" width="2" height="26" rx="1" fill={bodyDark} opacity="0.4" />
      <rect x="32" y="32" width="2" height="26" rx="1" fill={bodyDark} opacity="0.4" />
      {/* Headlights */}
      <rect x="7" cy="10" y="8" width="6" height="4" rx="2" fill="#fef08a" />
      <rect x="27" y="8" width="6" height="4" rx="2" fill="#fef08a" />
      <rect x="8" y="9" width="3" height="2" rx="1" fill="white" opacity="0.6" />
      <rect x="28" y="9" width="3" height="2" rx="1" fill="white" opacity="0.6" />
      {/* Taillights */}
      <rect x="7" y="56" width="6" height="3" rx="1.5" fill="#ef4444" />
      <rect x="27" y="56" width="6" height="3" rx="1.5" fill="#ef4444" />
      {/* Side mirrors */}
      <ellipse cx="1" cy="22" rx="2" ry="3" fill={bodyDark} opacity="0.5" />
      <ellipse cx="39" cy="22" rx="2" ry="3" fill={bodyDark} opacity="0.5" />
      {/* Wheels - bigger */}
      <rect x="1" y="12" width="6" height="12" rx="3" fill="#1e1e1e" />
      <rect x="33" y="12" width="6" height="12" rx="3" fill="#1e1e1e" />
      <rect x="1" y="44" width="6" height="12" rx="3" fill="#1e1e1e" />
      <rect x="33" y="44" width="6" height="12" rx="3" fill="#1e1e1e" />
      <rect x="2" y="15" width="3" height="5" rx="1.5" fill="#444" />
      <rect x="35" y="15" width="3" height="5" rx="1.5" fill="#444" />
      <rect x="2" y="47" width="3" height="5" rx="1.5" fill="#444" />
      <rect x="35" y="47" width="3" height="5" rx="1.5" fill="#444" />
      {/* Bumper */}
      <rect x="8" y="5" width="24" height="3" rx="1.5" fill={bodyDark} opacity="0.3" />
    </>
  );
}

function TaxiSvg({ color: _color, bodyDark: _bodyDark }: { color: string; bodyDark: string }) {
  const taxiYellow = '#fbbf24';
  const taxiDark = darken(taxiYellow, 40);
  return (
    <>
      <ellipse cx="20" cy="60" rx="16" ry="3" fill="rgba(0,0,0,0.25)" />
      {/* Body */}
      <rect x="4" y="10" width="32" height="48" rx="8" ry="8" fill={taxiYellow} />
      <rect x="4" y="34" width="32" height="24" rx="0" ry="0" fill={taxiDark} opacity="0.3" />
      <rect x="4" y="50" width="32" height="8" rx="0" ry="8" fill={taxiDark} opacity="0.3" />
      {/* Hood */}
      <rect x="6" y="12" width="28" height="14" rx="6" ry="6" fill={taxiDark} opacity="0.2" />
      {/* TAXI sign on roof */}
      <rect x="12" y="5" width="16" height="7" rx="2" ry="2" fill="#ffffff" />
      <rect x="13" y="6" width="14" height="5" rx="1" ry="1" fill="#1e293b" />
      {/* Windshield */}
      <rect x="8" y="22" width="24" height="12" rx="4" ry="4" fill="#1e293b" opacity="0.85" />
      <rect x="10" y="24" width="10" height="3" rx="1.5" fill="white" opacity="0.25" />
      {/* Rear window */}
      <rect x="10" y="44" width="20" height="8" rx="3" ry="3" fill="#1e293b" opacity="0.7" />
      {/* Checker stripe */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
        <rect key={i} x={4 + i * 4} y="36" width="4" height="3" fill={i % 2 === 0 ? '#1e1e1e' : taxiYellow} opacity="0.7" />
      ))}
      {/* Headlights */}
      <circle cx="10" cy="14" r="3" fill="#fef08a" />
      <circle cx="30" cy="14" r="3" fill="#fef08a" />
      <circle cx="10" cy="14" r="2" fill="white" opacity="0.6" />
      <circle cx="30" cy="14" r="2" fill="white" opacity="0.6" />
      {/* Taillights */}
      <circle cx="10" cy="54" r="2.5" fill="#ef4444" />
      <circle cx="30" cy="54" r="2.5" fill="#ef4444" />
      {/* Side mirrors */}
      <ellipse cx="1" cy="26" rx="2" ry="3" fill={taxiDark} opacity="0.5" />
      <ellipse cx="39" cy="26" rx="2" ry="3" fill={taxiDark} opacity="0.5" />
      {/* Wheels */}
      <rect x="2" y="16" width="5" height="10" rx="2.5" fill="#1e1e1e" />
      <rect x="33" y="16" width="5" height="10" rx="2.5" fill="#1e1e1e" />
      <rect x="2" y="42" width="5" height="10" rx="2.5" fill="#1e1e1e" />
      <rect x="33" y="42" width="5" height="10" rx="2.5" fill="#1e1e1e" />
      <rect x="3" y="18" width="2" height="4" rx="1" fill="#444" />
      <rect x="35" y="18" width="2" height="4" rx="1" fill="#444" />
      <rect x="3" y="44" width="2" height="4" rx="1" fill="#444" />
      <rect x="35" y="44" width="2" height="4" rx="1" fill="#444" />
    </>
  );
}

function SportsSvg({ color, bodyDark }: { color: string; bodyDark: string }) {
  return (
    <>
      <ellipse cx="20" cy="58" rx="18" ry="3" fill="rgba(0,0,0,0.25)" />
      {/* Body - wider and lower */}
      <rect x="2" y="14" width="36" height="42" rx="10" ry="10" fill={color} />
      <rect x="2" y="34" width="36" height="22" rx="0" ry="0" fill={bodyDark} opacity="0.3" />
      <rect x="2" y="48" width="36" height="8" rx="0" ry="10" fill={bodyDark} opacity="0.3" />
      {/* Aggressive hood scoop */}
      <rect x="4" y="14" width="32" height="12" rx="6" ry="6" fill={bodyDark} opacity="0.25" />
      <rect x="16" y="15" width="8" height="4" rx="2" fill="#1e1e1e" opacity="0.4" />
      {/* Windshield - sleek/narrow */}
      <rect x="6" y="24" width="28" height="10" rx="4" ry="4" fill="#1e293b" opacity="0.9" />
      <rect x="8" y="26" width="12" height="2" rx="1" fill="white" opacity="0.25" />
      {/* Rear window - small */}
      <rect x="10" y="44" width="20" height="6" rx="3" ry="3" fill="#1e293b" opacity="0.7" />
      {/* Spoiler / wing */}
      <rect x="6" y="52" width="28" height="3" rx="1.5" fill={bodyDark} opacity="0.6" />
      <rect x="4" y="54" width="3" height="4" rx="1" fill={bodyDark} opacity="0.5" />
      <rect x="33" y="54" width="3" height="4" rx="1" fill={bodyDark} opacity="0.5" />
      {/* Headlights - aggressive/angular */}
      <rect x="5" y="16" width="8" height="3" rx="1.5" fill="#fef08a" />
      <rect x="27" y="16" width="8" height="3" rx="1.5" fill="#fef08a" />
      <rect x="6" y="16.5" width="4" height="2" rx="1" fill="white" opacity="0.6" />
      <rect x="28" y="16.5" width="4" height="2" rx="1" fill="white" opacity="0.6" />
      {/* Taillights - wide strip */}
      <rect x="5" y="51" width="8" height="2" rx="1" fill="#ef4444" />
      <rect x="27" y="51" width="8" height="2" rx="1" fill="#ef4444" />
      {/* Side mirrors */}
      <ellipse cx="0" cy="28" rx="2" ry="2.5" fill={bodyDark} opacity="0.5" />
      <ellipse cx="40" cy="28" rx="2" ry="2.5" fill={bodyDark} opacity="0.5" />
      {/* Wheels - wider */}
      <rect x="0" y="18" width="6" height="10" rx="3" fill="#1e1e1e" />
      <rect x="34" y="18" width="6" height="10" rx="3" fill="#1e1e1e" />
      <rect x="0" y="40" width="6" height="10" rx="3" fill="#1e1e1e" />
      <rect x="34" y="40" width="6" height="10" rx="3" fill="#1e1e1e" />
      <rect x="1" y="20" width="3" height="4" rx="1.5" fill="#444" />
      <rect x="36" y="20" width="3" height="4" rx="1.5" fill="#444" />
      <rect x="1" y="42" width="3" height="4" rx="1.5" fill="#444" />
      <rect x="36" y="42" width="3" height="4" rx="1.5" fill="#444" />
      {/* Center stripe */}
      <line x1="20" y1="14" x2="20" y2="22" stroke="white" strokeWidth="1.5" opacity="0.2" strokeLinecap="round" />
    </>
  );
}

export default function CarSvg({ color = '#ef4444', direction = 'down', className = '', variant = 'sedan' }: CarSvgProps) {
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
      {variant === 'sedan' && <SedanSvg color={color} bodyDark={bodyDark} />}
      {variant === 'pickup' && <PickupSvg color={color} bodyDark={bodyDark} />}
      {variant === 'taxi' && <TaxiSvg color={color} bodyDark={bodyDark} />}
      {variant === 'sports' && <SportsSvg color={color} bodyDark={bodyDark} />}
    </svg>
  );
}
