/* eslint-disable import/no-anonymous-default-export */
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import axios from "axios";
import { toast } from "react-toastify";
import { Routing } from "../routes/routing";
import messages from "../shared/constants/messages";
import { HttpStatusCode } from "../shared/enums/http-status-code";
import { adminLogout } from "../store/slices/authSlice";
import store from "../store/store";
import { getBaseURL } from "../utils/commonFunctions";

// Box cricket API contract (RCB_backend/API.md):
// - success bodies are the payload itself (no { success, data } wrapper)
// - errors are { success: false, message, errors?: [{ path, message }] }
// - no refresh token: a 401 on a signed-in request means the session ended
declare module "axios" {
    interface AxiosRequestConfig {
        // The caller shows the error itself (e.g. inline on the login form).
        skipErrorToast?: boolean;
    }
}

export interface IApiErrorBody {
    success: false;
    message: string;
    errors?: { path: string; message: string }[];
}

const SESSION_EXPIRED_KEY = "rcb-admin-session-expired";

export const getErrorMessage = (error: unknown): string => {
    const err = error as AxiosError<IApiErrorBody>;
    const body = err?.response?.data;
    if (body?.errors?.length) return body.errors[0].message;
    if (body?.message) return body.message;
    if (err?.response === undefined && err?.request) return messages.NetworkError;
    return messages.SomethingWentWrong;
};

export const getErrorStatus = (error: unknown): number | undefined =>
    (error as AxiosError)?.response?.status;

// Field errors from a 400 validation response, keyed by field path (for Formik setErrors).
export const getFieldErrors = (error: unknown): Record<string, string> =>
    Object.fromEntries(
        ((error as AxiosError<IApiErrorBody>)?.response?.data?.errors ?? []).map((e) => [e.path, e.message]),
    );

export const takeSessionExpiredFlag = (): boolean => {
    const flagged = sessionStorage.getItem(SESSION_EXPIRED_KEY) === "1";
    sessionStorage.removeItem(SESSION_EXPIRED_KEY);
    return flagged;
};

const client = axios.create();

client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = store.getState()?.UserData?.accessToken;
    const apiBaseURL = getBaseURL(import.meta.env.VITE_BASE_URL || "");

    if (config.url && !config.url.startsWith("http")) {
        config.url = apiBaseURL + config.url.replace(/^\//, "");
    }
    config.headers = config.headers ?? {};
    if (token && config.headers.Authorization === undefined) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

client.interceptors.response.use(
    (response) => response,
    (error: AxiosError<IApiErrorBody>) => {
        const status = error.response?.status;
        const hadToken = !!store.getState()?.UserData?.accessToken;

        // Signed-in request rejected: password changed, logout-all, deactivated or token expired.
        if (status === HttpStatusCode.Unauthorized && hadToken) {
            store.dispatch(adminLogout());
            sessionStorage.setItem(SESSION_EXPIRED_KEY, "1");
            if (!window.location.pathname.startsWith(Routing.Login)) {
                window.location.assign(Routing.Login);
            }
            return Promise.reject(error);
        }

        if (!error.config?.skipErrorToast) {
            toast.error(getErrorMessage(error), { toastId: getErrorMessage(error) });
        }
        return Promise.reject(error);
    },
);

export default {
    get: client.get,
    post: client.post,
    put: client.put,
    delete: client.delete,
    patch: client.patch,
};
