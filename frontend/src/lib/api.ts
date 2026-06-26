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
    ...options,
  });

  let data;

  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const error: any = new Error(data?.message || data?.error || "API error");
    error.code = data?.code;
    error.status = res.status;
    throw error;
  }

  return data;
}

export function redirect(path: string) {
    window.location.href = `${API_BASE}${path}`;
}