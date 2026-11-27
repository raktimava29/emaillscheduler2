import { FiSend } from "react-icons/fi";

export default function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-10 w-10 -rotate-6 items-center justify-center rounded-xl bg-sun text-ink">
        <FiSend size={19} aria-hidden />
      </span>
      <span className={`font-display text-xl font-extrabold ${inverted ? "text-white" : "text-ink"}`}>
        ChronoMail
      </span>
    </div>
  );
}
