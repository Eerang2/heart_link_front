// src/auth/tokenStore.js
// 전역 토큰 저장소: React 밖(axios)과 안(AuthContext) 모두에서 공용으로 사용
let _access = typeof localStorage !== "undefined" ? localStorage.getItem("accessToken") : null;
// refreshToken은 HttpOnly 쿠키로 쓰는 경우가 많아 저장 안 함. 필요하면 추가 가능.
const subs = new Set();

export const tokenStore = {
    getAccess() {
        // 메모리 값 우선, 없으면 localStorage 참조
        return _access ?? (typeof localStorage !== "undefined" ? localStorage.getItem("accessToken") : null);
    },
    setAccess(token) {
        console.log("token " + token)
        _access = token || null;
        if (typeof localStorage !== "undefined") {
            if (token) localStorage.setItem("accessToken", token);
            else localStorage.removeItem("accessToken");
        }
        subs.forEach((cb) => cb({ accessToken: _access }));
    },
    clear() {
        _access = null;
        if (typeof localStorage !== "undefined") {
            localStorage.removeItem("accessToken");
        }
        subs.forEach((cb) => cb({ accessToken: null }));
    },
    subscribe(cb) {
        subs.add(cb);
        return () => subs.delete(cb);
    },
};