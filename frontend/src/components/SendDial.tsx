import { useState } from "react";
import { FiSend } from "react-icons/fi";

function label(hour: number) {
  const h = hour % 12 || 12;
  return `${h}:00 ${hour < 12 ? "AM" : "PM"}`;
}

/** Playable preview of scheduling: drag the hour and the plane follows the day. */
export default function SendDial() {
  const [hour, setHour] = useState(9);
  const progress = hour / 23;
  const angle = Math.PI * (1 - progress);
  const x = 160 + 140 * Math.cos(angle);
  const y = 160 - 130 * Math.sin(angle);

  return (
    <div className="w-full max-w-sm">
      <div className="relative">
        <svg viewBox="0 0 320 175" className="w-full" aria-hidden>
          <path d="M20 160 A140 130 0 0 1 300 160" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="2" strokeDasharray="4 8" />
          <line x1="0" y1="161" x2="320" y2="161" stroke="#fff" strokeOpacity=".35" />
        </svg>
        <span
          aria-hidden
          className="absolute flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-sun text-ink shadow-lg transition-all duration-200"
          style={{ left: `${(x / 320) * 100}%`, top: `${(y / 175) * 100}%` }}
        >
          <FiSend size={20} style={{ transform: `rotate(${progress * 90}deg)` }} />
        </span>
        <p className="absolute inset-x-0 bottom-5 text-center font-display text-4xl font-extrabold">{label(hour)}</p>
      </div>
      <input
        type="range"
        min={0}
        max={23}
        value={hour}
        onChange={(e) => setHour(Number(e.target.value))}
        aria-label="Preview a send time"
        aria-valuetext={label(hour)}
        className="mt-3 w-full cursor-grab accent-sun active:cursor-grabbing"
      />
      <p className="mt-1 text-sm text-white/80">Drag to pick the moment your email leaves.</p>
    </div>
  );
}
