import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiChevronRight, FiClock, FiEdit3, FiCheck } from "react-icons/fi";
import { formatCountdown, formatDateTime } from "../lib/time";
import { useNow } from "../lib/useNow";
import { apiFetch } from "../lib/api";

interface Email {
  id: string;
  recipient_email: string;
  subject: string;
  scheduled_at?: string;
  sent_at?: string;
  status: "scheduled" | "sent";
}

interface TabsProps {
  activeTab: "scheduled" | "sent";
  search: string;
  refreshKey: number;
}

export default function Tabs({ activeTab, search, refreshKey }: TabsProps) {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const now = useNow();

  useEffect(() => {
  let mounted = true;

  async function fetchEmails(initial = false) {
    if (initial) setLoading(true);

    try {
      const data = await apiFetch(`/emails/${activeTab}`);

      if (mounted) {
        setEmails(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (initial && mounted) {
        setLoading(false);
      }
    }
  }

  fetchEmails(true);

  const interval = setInterval(() => fetchEmails(false), 5000);

  return () => {
    mounted = false;
    clearInterval(interval);
  };
}, [activeTab]);

  useEffect(() => {
    if (refreshKey === 0) return;

    apiFetch(`/emails/${activeTab}`)
      .then(setEmails)
      .catch((err) => console.error(err));
    // Only a manual refresh should trigger this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const filteredEmails = useMemo(() => {
    const query = search.toLowerCase();

    return emails.filter((mail) =>
      mail.recipient_email.toLowerCase().includes(query) ||
      mail.subject.toLowerCase().includes(query)
    );
  }, [emails, search]);

  if (loading) {
    return (
      <div role="status" aria-label="Loading emails" className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-white" />
        ))}
      </div>
    );
  }

  if (filteredEmails.length === 0) {
    const searching = search.trim() !== "";

    return (
      <div className="card flex flex-col items-center px-6 py-16 text-center">
        <h2 className="text-xl font-bold">
          {searching ? "No matches" : activeTab === "scheduled" ? "Nothing waiting to go" : "Nothing sent yet"}
        </h2>
        <p className="mt-2 max-w-sm text-sm text-slate2">
          {searching
            ? "Try a different recipient or subject."
            : "Write an email and pick when it should leave."}
        </p>
        {!searching && (
          <Link to="/compose" className="btn-primary mt-6">
            <FiEdit3 aria-hidden /> Compose
          </Link>
        )}
      </div>
    );
  }

  const next = activeTab === "scheduled" && !search.trim() ? filteredEmails[0] : null;

  return (
    <div className="space-y-5">
      {next?.scheduled_at && (
        <Link to={`/mail/${next.id}`} className="block animate-rise rounded-2xl bg-cobalt p-6 text-white transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-cobalt/30">
          <p className="text-sm text-white/80">Next email leaves</p>
          <p className="font-display text-4xl font-extrabold tabular-nums text-sun sm:text-5xl">
            {formatCountdown(next.scheduled_at, now)}
          </p>
          <p className="mt-3 truncate font-semibold">{next.subject}</p>
          <p className="truncate text-sm text-white/80">To {next.recipient_email}</p>
        </Link>
      )}

      <ul className="card divide-y divide-line">
        {filteredEmails.map((mail) => {
          const time = activeTab === "scheduled" ? mail.scheduled_at : mail.sent_at;

          return (
            <li key={mail.id}>
              <Link to={`/mail/${mail.id}`} className="group flex items-center gap-4 px-4 py-4 transition hover:bg-sky/60 sm:px-5">
                <span aria-hidden className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky font-display text-lg font-bold text-cobalt transition group-hover:-rotate-6 group-hover:bg-sun group-hover:text-ink">
                  {mail.recipient_email.charAt(0).toUpperCase()}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{mail.subject}</p>
                  <p className="truncate text-sm text-slate2">To {mail.recipient_email}</p>
                  <p className={`mt-1 flex items-center gap-1.5 text-xs font-semibold ${activeTab === "scheduled" ? "text-cobalt" : "text-mint"}`}>
                    {activeTab === "scheduled" ? <FiClock aria-hidden /> : <FiCheck aria-hidden />}
                    {formatDateTime(time)}
                  </p>
                </div>

                <FiChevronRight aria-hidden className="shrink-0 text-slate2 transition group-hover:translate-x-1 group-hover:text-cobalt" />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
