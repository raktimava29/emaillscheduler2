import { useState } from "react";
import { FiSearch, FiRefreshCw } from "react-icons/fi";

interface HeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
}

export default function Header({
  search,
  onSearchChange,
  onRefresh,
}: HeaderProps) {
  const [turns, setTurns] = useState(0);

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <FiSearch aria-hidden className="absolute left-4 top-1/2 -translate-y-1/2 text-slate2" />
        <input
          type="search"
          aria-label="Search emails"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by recipient or subject"
          className="field rounded-full pl-11"
        />
      </div>

      <button
        onClick={() => {
          setTurns((t) => t + 1);
          onRefresh();
        }}
        className="icon-btn border border-line bg-white"
        aria-label="Refresh"
        title="Refresh"
      >
        <FiRefreshCw
          size={18}
          aria-hidden
          className="transition-transform duration-500"
          style={{ transform: `rotate(${turns * 360}deg)` }}
        />
      </button>
    </div>
  );
}
