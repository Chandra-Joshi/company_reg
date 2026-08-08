const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

export const SERVER_ORIGIN = API_URL.replace(/\/api\/?$/, "");

export function documentUrl(filePath: string): string {
  return `${SERVER_ORIGIN}/uploads/${filePath}`;
}
