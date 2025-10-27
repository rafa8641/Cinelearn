export const API_URL =
  import.meta.env.VITE_API_URL || "https://cinelearn.onrender.com"; 

export async function apiFetch(path, options = {}) {
  const url = `${API_URL}${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  return res;
}
