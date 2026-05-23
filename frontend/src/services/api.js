import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export function formatApiError(detail) {
  if (detail == null) return "Algo deu errado. Tente novamente.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e)))
      .filter(Boolean)
      .join(" ");
  }
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}

export function brl(n) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(n || 0));
}

export function fmtDate(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR");
  } catch {
    return iso;
  }
}
