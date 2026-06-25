const API_BASE = import.meta.env.VITE_API_URL;

export async function apiFetch(
  path: string,
  options: RequestInit = {}
) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (res.status === 401) {
    window.location.href = "/";
  }

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error?.error || "API error");
  }

  return res.json();
}
