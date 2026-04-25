import axios from "axios";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "").trim();

if (!API_BASE_URL) {
  console.error(
    "VITE_API_URL is missing. Set it in Vercel project env vars (Production + Preview)."
  );
} else {
  console.log("API URL:", API_BASE_URL);
}

export const api = axios.create({
  baseURL: API_BASE_URL || "/",
});
