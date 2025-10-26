import { useEffect, useRef } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";


const NaverCallback = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const once = useRef(false);



    useEffect(() => {
        if (once.current) return;            // ✅ 개발모드 중복 실행 방지
        once.current = true;

        const params = new URLSearchParams(location.search);
        const code = params.get("code");
        const state = params.get("state");
        const savedState = sessionStorage.getItem("oauth_state");

        // ✅ state 검증
        if (!code || !state || state !== savedState) {
            console.error("OAuth state mismatch or missing parameters.");
            navigate("/"); // 실패 시 홈 등으로 이동
            return;
        }
        // ✅ 사용 후 바로 제거 (재호출 방지)
        sessionStorage.removeItem("oauth_state");

        const API_BASE = (process.env.REACT_APP_API_BASE_URL || "").trim();
        if (!API_BASE) {
            console.error("REACT_APP_API_BASE_URL is missing");
            navigate("/");
            return;
        }

        (async () => {
            try {
                // ✅ GET 쿼리 대신 POST JSON으로 전달 (권장)
                const { data } = await axios.post(
                    `${API_BASE}/api/naver/callback`,
                    { code, state },
                    { withCredentials: true }
                );

                if (data.status === "LOGIN") {
                    const res = await axios.post(
                        `${API_BASE}/login/${data.id}`,
                        null,
                        { withCredentials: true }
                    );
                    const accessToken = res.data?.accessToken;
                    if (!accessToken) throw new Error("No access token");
                    // TODO: login(accessToken); // 네가 쓰는 전역 로그인 함수
                    navigate("/main");
                } else if (data.status === "AGREEMENT" || data.status === "NEED_AGREEMENT") {
                    sessionStorage.setItem("tempSignupToken", data.token);
                    navigate("/member/termsAgree");
                } else {
                    console.error("Unexpected status:", data);
                    navigate("/");
                }
            } catch (err) {
                console.error("네이버 인증 처리 에러:", err);
                navigate("/");
            }
        })();
    }, [location, navigate]);

    return <div>네이버 인증 처리 중입니다...</div>;
};

export default NaverCallback;
