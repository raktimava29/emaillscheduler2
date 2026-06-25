import { useEffect, useState } from "react";
import Header from "../components/Header";
import Tabs from "../components/Tabs";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { useAuth } from "../auth/useAuth";

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
    async function fetchCounts() {
      try {
        const [scheduledRes, sentRes] = await Promise.all([
          apiFetch("/emails/scheduled"),
          apiFetch("/emails/sent"),
        ]);

        setScheduledCount(scheduledRes.length);
        setSentCount(sentRes.length);
      } catch (err) {
        console.error("Unexpected error", err);
      }
    }

    fetchCounts();
  }, [navigate]);

  const handleLogout = async () => {
    await auth.logout();
    navigate("/");
  };

  const getInitials = (email: string) => {
    return email.slice(0, 2).toUpperCase();
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100/50">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-200/80 flex flex-col shadow-sm">
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent" style={{ fontFamily: 'SF Pro Display, system-ui, sans-serif' }}>
              ChronoMail
            </h1>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-6">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200/50">
            {userProfile?.avatar_url ? (
              <img
                src={userProfile.avatar_url}
                className="h-11 w-11 rounded-full ring-2 ring-white shadow-md"
                alt="User"
              />
            ) : (
              <div className="h-11 w-11 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                {user?.email ? getInitials(user.email) : "US"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.email.split("@")[0]}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Compose Button */}
        <div className="px-6 pb-6">
          <button
            onClick={() => navigate("/compose")}
            className="group w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3.5 font-semibold shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Compose</span>
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-6 pb-6">
          <p className="mb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Mailboxes
          </p>

          <div className="space-y-1">
            <button
              onClick={() => setActiveTab("scheduled")}
              className={`group flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                activeTab === "scheduled"
                  ? "bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Scheduled</span>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                activeTab === "scheduled"
                  ? "bg-emerald-200 text-emerald-700"
                  : "bg-gray-200 text-gray-600"
              }`}>
                {scheduledCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("sent")}
              className={`group flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                activeTab === "sent"
                  ? "bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Sent</span>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                activeTab === "sent"
                  ? "bg-emerald-200 text-emerald-700"
                  : "bg-gray-200 text-gray-600"
              }`}>
                {sentCount}
              </span>
            </button>
          </div>
        </div>

        {/* Logout Button */}
        <div className="p-6 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="group w-full flex items-center justify-center gap-2 rounded-xl border-2 border-red-200 text-red-600 py-3 text-sm font-semibold transition-all duration-200 hover:bg-red-50 hover:border-red-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-white/50 backdrop-blur-sm">
        <Header
          search={search}
          onSearchChange={setSearch}
          onRefresh={() => window.location.reload()}
          onFilter={() => alert("Filter feature coming soon 🙂")}
        />
        <Tabs activeTab={activeTab} search={search} />
      </main>
    </div>
  );
}
