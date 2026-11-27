import { useEffect, useState } from "react";
import Header from "../components/Header";
import Tabs from "../components/Tabs";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { useAuth } from "../auth/useAuth";
import { FiCheckCircle, FiClock, FiEdit3, FiLogOut } from "react-icons/fi";
import Logo from "../components/ui/Logo";

type TabType = "scheduled" | "sent";

export default function Dashboard() {
  const navigate = useNavigate();
  const auth = useAuth();
  const user = auth.user;

  const [activeTab, setActiveTab] = useState<TabType>(() => {
    return (localStorage.getItem("activeTab") as TabType) || "scheduled";
  });

  const [userProfile, setUserProfile] = useState<{
    name: string;
    email: string;
    avatar_url: string | null;
  } | null>(null);

  const [search, setSearch] = useState("");
  const [scheduledCount, setScheduledCount] = useState(0);
  const [sentCount, setSentCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await apiFetch("/auth/me");
        setUserProfile(data);
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    }

    fetchProfile();
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    async function fetchCounts() {
      try {
        const [scheduledRes, sentRes] = await Promise.all([
          apiFetch("/emails/scheduled"),
          apiFetch("/emails/sent"),
        ]);

        setScheduledCount(scheduledRes.length);
        setSentCount(sentRes.length);

        if (scheduledRes.length === 0 && interval) {
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Unexpected error", err);
      }
    }

    fetchCounts();

    interval = setInterval(fetchCounts, 5000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [refreshKey]);

  const handleLogout = async () => {
    await auth.logout();
    navigate("/");
  };

  const getInitials = (email: string) => {
    return email.slice(0, 2).toUpperCase();
  };

  const mailboxes = [
    { id: "scheduled" as const, label: "Scheduled", count: scheduledCount, Icon: FiClock },
    { id: "sent" as const, label: "Sent", count: sentCount, Icon: FiCheckCircle },
  ];

  return (
    <div className="flex min-h-screen flex-col md:h-screen md:flex-row">
      <aside className="flex shrink-0 flex-col gap-4 border-b border-line bg-white p-4 md:w-72 md:gap-6 md:border-b-0 md:border-r md:p-6">
        <div className="flex items-center justify-between">
          <Logo />
          <button onClick={handleLogout} className="icon-btn md:hidden" aria-label="Log out">
            <FiLogOut aria-hidden />
          </button>
        </div>

        <button onClick={() => navigate("/compose")} className="btn-sun group w-full py-3.5 text-base">
          <FiEdit3 aria-hidden className="transition group-hover:-rotate-12 group-hover:scale-110" /> Compose
        </button>

        <nav aria-label="Mailboxes" className="grid grid-cols-2 gap-2 md:grid-cols-1">
          {mailboxes.map(({ id, label, count, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              aria-current={activeTab === id ? "page" : undefined}
              className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition active:scale-95 ${
                activeTab === id ? "bg-cobalt text-white" : "text-slate2 hover:bg-sky hover:text-ink"
              }`}
            >
              <span className="flex items-center gap-3"><Icon size={18} aria-hidden /> {label}</span>
              <span key={count} className={`animate-rise rounded-full px-2.5 py-0.5 text-xs tabular-nums ${activeTab === id ? "bg-white text-cobalt" : "bg-sky text-ink"}`}>
                {count}
              </span>
            </button>
          ))}
        </nav>

        <div className="mt-auto hidden items-center gap-3 border-t border-line pt-5 md:flex">
          {userProfile?.avatar_url ? (
            <img src={userProfile.avatar_url} className="h-10 w-10 rounded-full" alt="" />
          ) : (
            <span aria-hidden className="flex h-10 w-10 items-center justify-center rounded-full bg-cobalt text-sm font-bold text-white">
              {user?.email ? getInitials(user.email) : "US"}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{user?.email.split("@")[0]}</p>
            <p className="truncate text-xs text-slate2">{user?.email}</p>
          </div>
          <button onClick={handleLogout} className="icon-btn" aria-label="Log out" title="Log out">
            <FiLogOut aria-hidden />
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-auto p-4 sm:p-8">
        <div className="mx-auto max-w-3xl space-y-5">
          <h1 className="text-3xl font-extrabold">
            {activeTab === "scheduled" ? "Scheduled" : "Sent"}
          </h1>
          <Header search={search} onSearchChange={setSearch} onRefresh={() => setRefreshKey((k) => k + 1)} />
          <Tabs activeTab={activeTab} search={search} refreshKey={refreshKey} />
        </div>
      </main>
    </div>
  );
}
