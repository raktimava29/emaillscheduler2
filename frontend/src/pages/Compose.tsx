import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiFetch, redirect } from "../lib/api";
import AIModal from "../components/AIModal";

export default function Compose() {
  const navigate = useNavigate();
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
      alert("✅ Gmail connected successfully.");
    }
  }, [searchParams]);

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
      alert("Please fill all required fields");
      return;
    }

    const recipients = to
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);

    if (recipients.length === 0) {
      alert("Please add at least one recipient");
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

        alert(
            scheduledTime
                ? "Emails scheduled successfully"
                : "Emails sent successfully"
        );

        navigate("/dashboard");
    } catch (err: unknown) {
        setIsSending(false);

        if (
          err instanceof Error &&
          (err as Error & { code?: string }).code === "GMAIL_NOT_CONNECTED"
        ) {
          redirect("/gmail/connect");
          return;
        }

        alert(
          err instanceof Error
            ? err.message
            : "Failed to schedule emails"
        );
      }
  };

  const formatScheduledTime = () => {
    if (!scheduledTime) return null;
    const date = new Date(scheduledTime);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100/50">
      <div className="flex flex-1 flex-col bg-white/80 backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200/80 bg-white/90 backdrop-blur-md px-8 py-5">
          <div className="flex items-center gap-4">
            <button
              aria-label="go-back"
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-10 h-10 rounded-xl text-gray-600 hover:bg-gray-100 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">New Message</h1>
              <p className="text-sm text-gray-500">Compose and schedule your email</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* AI Email Generation */}
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
            >
              Generate for JD
            </button>
            
            {/* Schedule Button */}
            <button
              aria-label="showScheduler"
              onClick={() => setShowScheduler((p) => !p)}
              className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 ${
                showScheduler || scheduledTime
                  ? "bg-emerald-100 text-emerald-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={isSending}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-2.5 font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSending ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  {scheduledTime ? "Schedule" : "Send"}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Scheduled Time Badge */}
        {scheduledTime && !showScheduler && (
          <div className="px-8 pt-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200">
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-emerald-700">
                Scheduled for {formatScheduledTime()}
              </span>
              <button
                aria-label="cancelSchedule"
                onClick={cancelSchedule}
                className="ml-2 text-emerald-600 hover:text-emerald-800"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="flex flex-1 gap-8 p-8 overflow-hidden">
          <div className="flex flex-1 flex-col gap-6 overflow-auto">
            {/* From Field */}
            <div className="flex items-center gap-4">
              <label className="w-20 text-sm font-medium text-gray-600">From</label>
              <input
                type="email"
                aria-label="email"
                value={profile?.email ?? ""}
                readOnly
                className="flex-1 rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-600 cursor-not-allowed"
              />
            </div>

            {/* To Field */}
            <div className="flex items-start gap-4">
              <label className="w-20 text-sm font-medium text-gray-600 pt-2.5">To</label>
              <div className="flex-1">
                <input
                  value={to}
                  aria-label="multiple-emails"
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="recipient@example.com, another@example.com"
                  className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-all duration-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                />
                <p className="mt-1.5 text-xs text-gray-500">Separate multiple emails with commas</p>
              </div>
            </div>

            {/* Subject Field */}
            <div className="flex items-center gap-4">
              <label className="w-20 text-sm font-medium text-gray-600">Subject</label>
              <input
                value={subject}
                aria-label="subject-body"
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject"
                className="flex-1 rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-all duration-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            {/* Body Field */}
            <div className="flex flex-1 flex-col gap-2 min-h-0">
              <label className="text-sm font-medium text-gray-600">Message</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your email message here..."
                className="flex-1 resize-none rounded-xl border-2 border-gray-200 bg-white p-4 text-sm outline-none transition-all duration-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>
          </div>

          {/* Scheduler Panel */}
          {showScheduler && (
            <div className="w-80 shrink-0 animate-slideIn">
              <div className="rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-xl">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Schedule Send</h3>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pick date & time</label>
                  <input
                    aria-label="time"
                    type="datetime-local"
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm outline-none transition-all duration-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    onChange={(e) =>
                      setScheduledTime(new Date(e.target.value).toISOString())
                    }
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Quick Options</p>
                  <button
                    onClick={() => selectPreset(1)}
                    className="flex items-center justify-between w-full rounded-xl px-4 py-3 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 border border-gray-200"
                  >
                    <span>In 1 hour</span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => selectPreset(10)}
                    className="flex items-center justify-between w-full rounded-xl px-4 py-3 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 border border-gray-200"
                  >
                    <span>In 10 hours</span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => selectPreset(24)}
                    className="flex items-center justify-between w-full rounded-xl px-4 py-3 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 border border-gray-200"
                  >
                    <span>Tomorrow</span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={cancelSchedule}
                    className="flex-1 rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setShowScheduler(false)}
                    className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/40"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { 
            opacity: 0; 
            transform: translateX(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateX(0); 
          }
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>

      {isOpen && (
        <AIModal
            open
            onClose={() => setIsOpen(false)}
            onGenerated={(email) => {
              setTo(email.recipient ?? "");
              setSubject(email.subject);
              setBody(email.body);
              setResumeFile(email.resumeFile);
            }}
        />
    )}
    </div>
  );
}
