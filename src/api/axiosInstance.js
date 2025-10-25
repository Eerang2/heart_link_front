// src/api/axiosInstance.js
import axios from "axios";
import { tokenStore } from "../context/tokenStore";



// ===== 환경별 설정 =====
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;// 백엔드 주소
const REFRESH_URL = "/api/on/auth/refresh";   // 리프레시 엔드포인트 (서버와 정확히 일치)
const HOME_PATH   = "/";                      // 홈(로그인 대체)

// 메인 axios 인스턴스
const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // refresh 쿠키를 주고받기 위해 필수
    timeout: 15000,
});

// 리프레시 전용(인터셉터 없음 = Authorization 안 붙음)
const refreshClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    timeout: 15000,
});

// ===== 요청 인터셉터: Authorization 주입 =====
api.interceptors.request.use((config) => {
    const token = tokenStore.getAccess();
    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    } else if (config.headers?.Authorization) {
        delete config.headers.Authorization; // 남아 있으면 제거
    }
    return config;
});

// ===== 동시성 제어 (대기열) =====
let isRefreshing = false;
const waiters = []; // [(err, newToken) => void]
function enqueue(cb) { waiters.push(cb); }
function resolveAll(newToken) { while (waiters.length) { try { waiters.shift()(null, newToken); } catch {} } }
function rejectAll(err)      { while (waiters.length) { try { waiters.shift()(err,  null); } catch {} } }

// ===== 가드/헬퍼 =====
let hasRedirectedFor401 = false;

function isOnHome() {
    if (typeof window === "undefined") return false;
    return window.location.pathname === HOME_PATH;
}

function redirectToHomeOnce() {
    if (typeof window === "undefined") return;
    if (hasRedirectedFor401) return;
    hasRedirectedFor401 = true;
    if (!isOnHome()) {
        window.location.replace(`${HOME_PATH}?reason=expired`);
    }
    // 이미 홈이면 아무 것도 안 함 (루프 방지)
}

function isRefreshRequest(cfg) {
    const url = cfg?.url || "";
    return url.includes(REFRESH_URL);
}

// 보호 API만 대상으로(서버 규칙: /api/on/**)
function isProtectedRequest(cfg) {
    const url = cfg?.url || "";
    // axios는 절대/상대 모두 가능 → includes 사용
    return url.includes("/api/on/");
}

// ===== 응답 인터셉터 =====
api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config || {};
        const status = error.response?.status;

        // 홈(/)에서는 어떤 401도 리다이렉트/리프레시 시도하지 않음 → 무한 루프 방지
        if (isOnHome() && status === 401) {
            tokenStore.clear(); // 토큰만 비움
            return Promise.reject(error);
        }

        // 리프레시 요청 자체가 401이면 즉시 만료 처리 (무한 리프레시 루프 방지)
        if (isRefreshRequest(original) && status === 401) {
            tokenStore.clear();
            redirectToHomeOnce();
            return Promise.reject(error);
        }

        // 보호 API가 아닌 곳의 401은 프론트에서 건드리지 않음
        if (status === 401 && !isProtectedRequest(original)) {
            return Promise.reject(error);
        }

        // 보호 API 401 → 리프레시 시도 (한 번만)
        if (status === 401 && !original.__isRetryRequest) {
            original.__isRetryRequest = true;

            // 이미 리프레시 중이면 대기열 합류
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    enqueue((err, newToken) => {
                        if (err || !newToken) return reject(err || error);
                        original.headers = original.headers || {};
                        original.headers.Authorization = `Bearer ${newToken}`;
                        resolve(api(original));
                    });
                });
            }

            // 내가 리프레시 시도
            try {
                isRefreshing = true;

                const resp = await refreshClient.post(REFRESH_URL, null);
                const newAccessToken = resp?.data?.accessToken;
                if (!newAccessToken) throw new Error("Invalid refresh response");

                tokenStore.setAccess(newAccessToken);
                resolveAll(newAccessToken);

                // 원요청 재시도
                original.headers = original.headers || {};
                original.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(original);
            } catch (refreshErr) {
                // ★ 리프레시 실패시에만 로그아웃 처리
                rejectAll(refreshErr);
                tokenStore.clear();
                // 알림 (원하면 제거 가능)
                if (typeof window !== "undefined") {
                    try { alert("로그아웃 되었습니다."); } catch {}
                }
                redirectToHomeOnce(); // 홈이 아니면 홈으로, 홈이면 아무 것도 안 함
                return Promise.reject(refreshErr);
            } finally {
                isRefreshing = false;
            }
        }

        // 그 외 에러는 그대로
        return Promise.reject(error);
    }
);

export default api;
