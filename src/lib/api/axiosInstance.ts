import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useErrorStore } from "@/lib/stores/errorStore";

const isServer = typeof window === "undefined";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    const errorStatus = error?.response?.status;
    const errorData = error?.response?.data as
      | { error?: string; code?: string }
      | undefined;
    const errorMessage =
      errorData?.error || error?.message || "Something went wrong";

    // Errors with a `code` are handled by the local mutation's onError so
    // the UI can react in a domain-specific way (e.g. EMAIL_EXISTS opens the
    // OTP modal). Skip the global toast in that case.
    const hasLocalHandler = Boolean(errorData?.code);

    if (!isServer && errorStatus && !hasLocalHandler) {
      const { setError } = useErrorStore.getState();

      switch (errorStatus) {
        case 401:
          setError(401, errorMessage);
          break;
        case 404:
          setError(404, errorMessage);
          break;
        case 400:
          setError(400, errorMessage);
          break;
        case 403:
          setError(403, errorMessage);
          break;
        case 500:
        case 502:
        case 503:
          setError(errorStatus, errorMessage);
          break;
        default:
          setError(errorStatus, errorMessage);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

