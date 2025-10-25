import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {useAuth} from "../context/AuthContext";


const NaverCallback = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const code = query.get("code");
        const state = query.get("state");
        const savedState = sessionStorage.getItem("oauth_state");

        // CSRF 방지를 위해 state 검증
        if (!code || !state || state !== savedState) {
            console.error("OAuth state mismatch or missing parameters.");
            return;
        }

        const API_BASE = process.env.REACT_APP_API_BASE_URL

        const handleNaverCallback = async () => {
            try {
                const response = await fetch(
                    `${API_BASE}/naver/callback?code=${code}&state=${state}`,
                    {
                        method: "GET",
                        credentials: "include", // 세션 쿠키 포함
                    }
                );

                if (!response.ok) {
                    throw new Error(`서버 응답 오류: ${response.status}`);
                }

                const data = await response.json();

                if (data.status === "LOGIN") {
                    const res = await axios.post(
                        `${API_BASE}/login/${data.id}`,
                        null, // POST body 없음
                        { withCredentials: true }
                    );
                    if (res.status === 200) {
                        const accessToken = res.data.accessToken;
                        login(accessToken); // 전역 상태 + localStorage 저장

                        navigate("/main");
                    } else {
                        console.error("로그인 에러");
                    }
                } else if (data.status === "AGREEMENT" || data.status === "NEED_AGREEMENT") {
                    sessionStorage.setItem("tempSignupToken", data.token);
                    navigate("/member/termsAgree");
                } else {
                    console.error("예상치 못한 상태:", data);
                }
            } catch (error) {
                console.error("네이버 인증 처리 중 에러:", error);
            }
        };

        handleNaverCallback();
    }, [location, navigate]);

    return <div>네이버 인증 처리 중입니다...</div>;
};

export default NaverCallback;
