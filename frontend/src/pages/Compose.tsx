import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiFetch, redirect } from "../lib/api";
import AIModal from "../components/AIModal";
import { FiArrowLeft, FiClock, FiPaperclip, FiSend, FiX, FiZap } from "react-icons/fi";
import Spinner from "../components/ui/Spinner";
import { useToast } from "../components/ui/toast-context";
import { formatDateTime } from "../lib/time";

export default function Compose() {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();

  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduledTime, setScheduledTime] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [profile, setProfile] = useState<{
    name: string;
    email: string;
    avatar_url: string | null;
  } | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isFlying, setIsFlying] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await apiFetch("/auth/me");
        setProfile(data);
      } catch (err) {
        console.error(err);
      }
    }

    loadProfile();

    if (searchParams.get("gmail") === "connected") {
      toast("Gmail connected.");
    }
  }, [searchParams, toast]);

  const selectPreset = (hoursFromNow: number) => {
    const date = new Date();
    date.setHours(date.getHours() + hoursFromNow);
    setScheduledTime(date.toISOString());
  };

  const cancelSchedule = () => {
    setScheduledTime(null);
    setShowScheduler(false);
  };

  const handleSend = async () => {
    if (!to || !subject || !body) {
      toast("Add a recipient, subject and message.", "error");
      return;
    }

    const recipients = to
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);

    if (recipients.length === 0) {
      toast("Add at least one recipient.", "error");
      return;
    }

    setIsSending(true);

    try {
        const formData = new FormData();

        formData.append("subject", subject);
        formData.append("body", body);

        formData.append(
            "startTime",
            scheduledTime ?? new Date().toISOString()
        );

        formData.append(
            "delayBetweenEmailsSeconds",
            "2"
        );

        formData.append(
            "hourlyLimit",
            "100"
        );

        recipients.forEach((recipient) => {
            formData.append("recipients", recipient);
        });

        if (resumeFile) {
            formData.append("resumeFile", resumeFile);
        }

        await apiFetch("/emails/schedule", {
            method: "POST",
            body: formData,
        });

        toast(
            scheduledTime
                ? "Emails scheduled"
                : "Emails queued to send"
        );

        // Let the plane take off before leaving the page.
        setIsFlying(true);
        setTimeout(() => navigate("/dashboard"), 1100);
    } catch (err: unknown) {
        setIsSending(false);

        if (
          err instanceof Error &&
          (err as Error & { code?: string }).code === "GMAIL_NOT_CONNECTED"
        ) {
          redirect("/gmail/connect");
          return;
        }

        toast(
          err instanceof Error
            ? err.message
            : "Failed to schedule emails",
          "error"
        );
      }
  };

  const recipientList = to.split(",").map((e) => e.trim()).filter(Boolean);
  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;

  return (
    <div className="min-h-screen pb-10">
      <header className="sticky top-0 z-10 border-b border-line bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-4 py-3">
          <button aria-label="Go back" onClick={() => navigate(-1)} className="icon-btn">
            <FiArrowLeft size={20} aria-hidden />
          </button>
          <h1 className="mr-auto text-xl font-extrabold">New message</h1>

          <button onClick={() => setIsOpen(true)} className="btn-sun group">
            <FiZap aria-hidden className="transition group-hover:rotate-12 group-hover:scale-125" /> Generate for JD
          </button>
          <button
            onClick={() => setShowScheduler((p) => !p)}
            aria-expanded={showScheduler}
            className="btn-ghost"
          >
            <FiClock aria-hidden /> Schedule
          </button>
          <button onClick={handleSend} disabled={isSending} className="btn-primary group">
            {isSending ? (
              <><Spinner /> Sending...</>
            ) : (
              <>
                <FiSend aria-hidden className="transition group-hover:-translate-y-0.5 group-hover:translate-x-1" />
                {scheduledTime ? "Schedule send" : "Send now"}
              </>
            )}
          </button>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col-reverse items-start gap-5 px-4 pt-6 lg:flex-row">
        <div className="card w-full min-w-0 flex-1 animate-rise">
          <div className="airmail" />
          <div className="space-y-4 p-5 sm:p-7">
            {scheduledTime && (
              <div className="flex w-fit animate-rise items-center gap-2 rounded-full bg-sky py-1 pl-4 pr-1 text-sm font-semibold text-cobalt">
                <FiClock aria-hidden />
                Leaves {formatDateTime(scheduledTime)}
                <button aria-label="Cancel schedule" onClick={cancelSchedule} className="icon-btn h-8 w-8">
                  <FiX aria-hidden />
                </button>
              </div>
            )}

            <div>
              <label htmlFor="from" className="label">From</label>
              <input id="from" type="email" value={profile?.email ?? ""} readOnly className="field cursor-default bg-sky/50 text-slate2" />
            </div>

            <div>
              <label htmlFor="to" className="label">To</label>
              <input
                id="to"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="recipient@example.com, another@example.com"
                className="field"
              />
              {recipientList.length > 0 ? (
                <ul aria-label="Recipients" className="mt-2 flex flex-wrap gap-2">
                  {recipientList.map((r, i) => (
                    <li key={i} className="max-w-full animate-rise truncate rounded-full bg-sky px-3 py-1 text-xs font-semibold">{r}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1.5 text-xs text-slate2">Separate multiple emails with commas</p>
              )}
            </div>

            <div>
              <label htmlFor="subject" className="label">Subject</label>
              <input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Email subject" className="field font-semibold" />
            </div>

            <div>
              <label htmlFor="message" className="label">Message</label>
              <textarea
                id="message"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your message, or generate one from a job description."
                className="field min-h-[20rem] resize-y leading-relaxed"
              />
              <p className="mt-1 text-right text-xs tabular-nums text-slate2">{wordCount} {wordCount === 1 ? "word" : "words"}</p>
            </div>

            {resumeFile && (
              <div className="flex w-fit max-w-full animate-rise items-center gap-2 rounded-xl border border-dashed border-cobalt py-1 pl-4 pr-1 text-sm">
                <FiPaperclip aria-hidden className="shrink-0 text-cobalt" />
                <span className="truncate font-semibold">{resumeFile.name}</span>
                <button aria-label="Remove attachment" onClick={() => setResumeFile(null)} className="icon-btn h-8 w-8">
                  <FiX aria-hidden />
                </button>
              </div>
            )}
          </div>
        </div>

        {showScheduler && (
          <aside className="card w-full animate-rise p-5 lg:sticky lg:top-24 lg:w-72">
            <h2 className="text-lg font-bold">Schedule send</h2>

            <div className="mt-4 grid grid-cols-3 gap-2 lg:grid-cols-1">
              {[
                { label: "In 1 hour", hours: 1 },
                { label: "In 10 hours", hours: 10 },
                { label: "Tomorrow", hours: 24 },
              ].map((preset) => (
                <button key={preset.hours} onClick={() => selectPreset(preset.hours)} className="btn-ghost rounded-xl">
                  {preset.label}
                </button>
              ))}
            </div>

            <label htmlFor="send-at" className="label mt-5">Or pick date and time</label>
            <input
              id="send-at"
              type="datetime-local"
              className="field"
              onChange={(e) =>
                setScheduledTime(e.target.value ? new Date(e.target.value).toISOString() : null)
              }
            />

            <p aria-live="polite" className="mt-4 min-h-[1.25rem] text-sm font-semibold text-cobalt">
              {scheduledTime && `Leaves ${formatDateTime(scheduledTime)}`}
            </p>

            <div className="mt-3 flex gap-2">
              <button onClick={cancelSchedule} className="btn-ghost flex-1">Cancel</button>
              <button onClick={() => setShowScheduler(false)} className="btn-primary flex-1">Done</button>
            </div>
          </aside>
        )}
      </main>

      {isFlying && (
        <div aria-hidden className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center overflow-hidden">
          <span className="flex h-24 w-24 animate-fly items-center justify-center rounded-3xl bg-sun text-ink shadow-2xl">
            <FiSend size={44} />
          </span>
        </div>
      )}

      {isOpen && (
        <AIModal
            open
            onClose={() => setIsOpen(false)}
            onGenerated={(email) => {
              setTo(email.recipient ?? "");
              setSubject(email.subject);
              setBody(email.body);
              setResumeFile(email.resumeFile);
              toast("Draft ready. Read it before you send.");
            }}
        />
      )}
    </div>
  );
}
