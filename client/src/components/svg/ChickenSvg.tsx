interface ChickenSvgProps {
  hit?: boolean;
  className?: string;
}

export default function ChickenSvg({ hit = false, className = '' }: ChickenSvgProps) {
  if (hit) {
    return (
      <svg viewBox="0 0 64 64" className={className} style={{ width: '100%', height: '100%' }} xmlns="http://www.w3.org/2000/svg">
        {/* Ground shadow */}
        <ellipse cx="32" cy="60" rx="20" ry="3.5" fill="rgba(0,0,0,0.18)" />

        {/* Body - tilted from impact */}
        <g transform="rotate(-15, 32, 34)">
          {/* Tail feathers (ruffled) */}
          <ellipse cx="14" cy="38" rx="7" ry="4" fill="#e8e5e0" transform="rotate(-35, 14, 38)" />
          <ellipse cx="12" cy="35" rx="6" ry="3.5" fill="#d4d0c8" transform="rotate(-45, 12, 35)" />
          <ellipse cx="16" cy="41" rx="5" ry="3" fill="#ece9e3" transform="rotate(-20, 16, 41)" />

          {/* Body base */}
          <ellipse cx="32" cy="36" rx="19" ry="17" fill="#f7f5f0" />
          {/* Body shading */}
          <ellipse cx="34" cy="40" rx="15" ry="12" fill="#efede8" />
          {/* Belly highlight */}
          <ellipse cx="30" cy="34" rx="11" ry="9" fill="#fdfcfa" />

          {/* Left wing (flailing up) */}
          <g transform="rotate(-40, 16, 30)">
            <ellipse cx="16" cy="30" rx="9" ry="6" fill="#e8e5e0" />
            <ellipse cx="14" cy="28" rx="6" ry="3.5" fill="#f0ede8" />
            <ellipse cx="10" cy="27" rx="4" ry="2" fill="#ddd9d2" />
          </g>

          {/* Right wing (flailing up) */}
          <g transform="rotate(35, 48, 28)">
            <ellipse cx="48" cy="28" rx="8" ry="5.5" fill="#e8e5e0" />
            <ellipse cx="50" cy="26" rx="5.5" ry="3" fill="#f0ede8" />
            <ellipse cx="53" cy="25" rx="3.5" ry="2" fill="#ddd9d2" />
          </g>

          {/* Neck */}
          <ellipse cx="38" cy="24" rx="8" ry="7" fill="#f7f5f0" />

          {/* Head */}
          <circle cx="40" cy="18" r="12" fill="#f7f5f0" />
          {/* Head highlight */}
          <circle cx="38" cy="15" r="7" fill="#fdfcfa" opacity="0.5" />
          {/* Cheek blush (red from panic) */}
          <circle cx="34" cy="20" r="3" fill="#fca5a5" opacity="0.5" />
          <circle cx="48" cy="18" r="2.5" fill="#fca5a5" opacity="0.5" />

          {/* Comb (flopping) */}
          <ellipse cx="36" cy="6" rx="3.5" ry="4" fill="#ef4444" transform="rotate(15, 36, 6)" />
          <ellipse cx="40" cy="4" rx="4" ry="4.5" fill="#dc2626" transform="rotate(10, 40, 4)" />
          <ellipse cx="44" cy="6" rx="3" ry="3.5" fill="#ef4444" transform="rotate(5, 44, 6)" />

          {/* Dizzy X X eyes */}
          <g stroke="#312e81" strokeWidth="2.5" strokeLinecap="round">
            <line x1="34" y1="14" x2="38" y2="18" />
            <line x1="38" y1="14" x2="34" y2="18" />
            <line x1="43" y1="13" x2="47" y2="17" />
            <line x1="47" y1="13" x2="43" y2="17" />
          </g>

          {/* Beak (open, squawking) */}
          <polygon points="50,14 60,16 50,19" fill="#fb923c" />
          <polygon points="50,18 58,22 50,20" fill="#ea580c" />

          {/* Wattle */}
          <ellipse cx="50" cy="22" rx="2.5" ry="4" fill="#ef4444" />
        </g>

        {/* Scattered feathers flying off */}
        <ellipse cx="8" cy="14" rx="4" ry="1.8" fill="#ece9e3" transform="rotate(-40, 8, 14)" />
        <ellipse cx="56" cy="10" rx="3.5" ry="1.5" fill="#f7f5f0" transform="rotate(30, 56, 10)" />
        <ellipse cx="10" cy="50" rx="3" ry="1.3" fill="#e8e5e0" transform="rotate(-50, 10, 50)" />
        <ellipse cx="55" cy="46" rx="3.5" ry="1.5" fill="#f0ede8" transform="rotate(25, 55, 46)" />
        <ellipse cx="6" cy="32" rx="2.5" ry="1.2" fill="#ddd9d2" transform="rotate(-20, 6, 32)" />

        {/* Dizzy stars */}
        <g fill="#facc15" opacity="0.85">
          <polygon points="16,8 17.5,12 21,12 18,14.5 19.5,18 16,16 12.5,18 14,14.5 11,12 14.5,12" transform="scale(0.6) translate(10, 2)" />
          <polygon points="16,8 17.5,12 21,12 18,14.5 19.5,18 16,16 12.5,18 14,14.5 11,12 14.5,12" transform="scale(0.5) translate(90, 4)" />
          <polygon points="16,8 17.5,12 21,12 18,14.5 19.5,18 16,16 12.5,18 14,14.5 11,12 14.5,12" transform="scale(0.45) translate(16, 56)" />
        </g>

        {/* Feet (splayed) */}
        <g fill="none" stroke="#fb923c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="24,50 20,56 16,58" />
          <polyline points="20,56 22,59" />
          <polyline points="20,56 24,58" />
          <polyline points="38,49 42,55 46,57" />
          <polyline points="42,55 40,58" />
          <polyline points="42,55 44,59" />
        </g>
      </svg>
    );
  }

  // Normal state — cute Crossy Road chicken facing right
  return (
    <svg viewBox="0 0 64 64" className={className} style={{ width: '100%', height: '100%' }} xmlns="http://www.w3.org/2000/svg">
      {/* Ground shadow */}
      <ellipse cx="32" cy="60" rx="16" ry="3.5" fill="rgba(0,0,0,0.13)" />

      {/* Tail feathers */}
      <ellipse cx="14" cy="40" rx="6" ry="3.5" fill="#e8e5e0" transform="rotate(-25, 14, 40)" />
      <ellipse cx="12" cy="37" rx="5" ry="3" fill="#d4d0c8" transform="rotate(-35, 12, 37)" />
      <ellipse cx="16" cy="42" rx="4.5" ry="2.5" fill="#ece9e3" transform="rotate(-15, 16, 42)" />

      {/* Body */}
      <ellipse cx="32" cy="38" rx="18" ry="16" fill="#f7f5f0" />
      {/* Body bottom shading */}
      <ellipse cx="33" cy="42" rx="14" ry="11" fill="#efede8" />
      {/* Belly highlight */}
      <ellipse cx="30" cy="35" rx="10" ry="8" fill="#fdfcfa" />

      {/* Left wing (tucked) */}
      <ellipse cx="17" cy="36" rx="7" ry="5.5" fill="#e8e5e0" transform="rotate(-8, 17, 36)" />
      <ellipse cx="15" cy="35" rx="4.5" ry="3" fill="#f0ede8" transform="rotate(-12, 15, 35)" />

      {/* Neck */}
      <ellipse cx="40" cy="26" rx="7" ry="6" fill="#f7f5f0" />

      {/* Head */}
      <circle cx="42" cy="20" r="12" fill="#f7f5f0" />
      {/* Head highlight */}
      <circle cx="40" cy="17" r="7" fill="#fdfcfa" opacity="0.5" />
      {/* Cheek blush */}
      <circle cx="48" cy="22" r="2.5" fill="#fda4af" opacity="0.35" />

      {/* Comb (red, perky) */}
      <ellipse cx="38" cy="8" rx="3" ry="4" fill="#ef4444" />
      <ellipse cx="42" cy="6" rx="3.5" ry="4.5" fill="#dc2626" />
      <ellipse cx="46" cy="8" rx="2.8" ry="3.5" fill="#ef4444" />

      {/* Eye - big and expressive */}
      <circle cx="46" cy="17" r="4" fill="white" />
      <circle cx="47" cy="17" r="3" fill="#1e1b4b" />
      <circle cx="48" cy="16" r="1.3" fill="white" />
      {/* Tiny lower catch light */}
      <circle cx="46.5" cy="18.5" r="0.6" fill="white" opacity="0.5" />

      {/* Eyebrow (determined look) */}
      <line x1="43" y1="12.5" x2="49" y2="12" stroke="#57534e" strokeWidth="1.5" strokeLinecap="round" />

      {/* Beak (pointing right) */}
      <polygon points="52,17 62,20 52,24" fill="#fb923c" />
      <polygon points="52,21 59,24 52,24" fill="#ea580c" />

      {/* Wattle */}
      <ellipse cx="52" cy="26" rx="2.5" ry="3.5" fill="#ef4444" />

      {/* Right wing hint (behind body) */}
      <ellipse cx="46" cy="38" rx="5" ry="4" fill="#e8e5e0" transform="rotate(10, 46, 38)" />

      {/* Feet */}
      <g fill="none" stroke="#fb923c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="27,52 24,57 20,59" />
        <polyline points="24,57 26,60" />
        <polyline points="24,57 28,59" />
        <polyline points="36,52 40,57 44,59" />
        <polyline points="40,57 38,60" />
        <polyline points="40,57 42,60" />
      </g>
    </svg>
  );
}
