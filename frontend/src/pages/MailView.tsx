import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { FiArrowLeft } from "react-icons/fi";
import LoadingScreen from "../components/LoadingScreen";
import { useAuth } from "../auth/useAuth";
import { formatCountdown, formatDateTime } from "../lib/time";
import { useNow } from "../lib/useNow";

interface Mail {
  id: string;
  recipient_email: string;
  subject: string;
  body: string;
  status: "scheduled" | "processing" | "sent" | "failed";
  scheduled_at?: string;
  sent_at?: string;
}

export default function MailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [mail, setMail] = useState<Mail | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const now = useNow();

  useEffect(() => {
    async function fetchMail() {
      try {
        const data = await apiFetch(`/emails/${id}`);
        setMail(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchMail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <LoadingScreen title="Opening email" description="Fetching the details." />
      </div>
    );
  }

  if (!mail) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
        <h1 className="text-3xl font-extrabold">Email not found</h1>
        <p className="mb-6 mt-2 text-slate2">It may have been deleted, or the link is wrong.</p>
        <button onClick={() => navigate("/dashboard")} className="btn-primary">Back to dashboard</button>
      </div>
    );
  }

  const sent = mail.status === "sent";
  const time = mail.status === "scheduled" ? mail.scheduled_at : mail.sent_at;
  const statusLabel = mail.status.charAt(0).toUpperCase() + mail.status.slice(1);

  return (
    <div className="min-h-screen px-4 py-6">
      <main className="mx-auto max-w-3xl">
        <button onClick={() => navigate(-1)} className="btn-ghost mb-4">
          <FiArrowLeft aria-hidden /> Back
        </button>

        <article className="card animate-rise">
          <div className="airmail" />
          <div className="p-6 sm:p-9">
            <div className="flex flex-col-reverse items-start justify-between gap-4 sm:flex-row">
              <h1 className="min-w-0 break-words text-3xl font-extrabold">{mail.subject}</h1>
              <div className={`shrink-0 animate-stamp rounded-full border-4 border-double px-5 py-2 text-center font-display font-extrabold ${sent ? "border-mint text-mint" : "border-cobalt text-cobalt"}`}>
                {statusLabel}
              </div>
            </div>

            <dl className="mt-6 grid grid-cols-[4rem_1fr] gap-y-1.5 border-y border-line py-4 text-sm">
              <dt className="text-slate2">From</dt>
              <dd className="break-all font-semibold">{user?.email}</dd>
              <dt className="text-slate2">To</dt>
              <dd className="break-all font-semibold">{mail.recipient_email}</dd>
              <dt className="text-slate2">{sent ? "Sent" : "Sends"}</dt>
              <dd className="font-semibold">
                {formatDateTime(time)}
                {mail.status === "scheduled" && time && (
                  <span className="ml-2 tabular-nums text-cobalt">{formatCountdown(time, now)}</span>
                )}
              </dd>
            </dl>

            <div className="mt-6 max-w-prose whitespace-pre-wrap break-words leading-relaxed">{mail.body}</div>
          </div>
        </article>
      </main>
    </div>
  );
}
