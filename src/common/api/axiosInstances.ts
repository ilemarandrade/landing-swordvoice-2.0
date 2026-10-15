import axios from "axios";
import { publicEnv } from "@/common/config/publicEnv";

// Única instancia HTTP de la app: toda petición pasa por request() (@/common/api/httpClient).
export const apiClient = axios.create({
  baseURL: publicEnv.NEXT_PUBLIC_API_URL,
  timeout: 10_000,
  headers: { "Accept-Language": "es" },
  adapter: "fetch",
});
