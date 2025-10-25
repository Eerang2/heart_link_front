export const requestNaverLogin = async () => {
    const state = crypto.randomUUID();
    sessionStorage.setItem("oauth_state", state); // CSRF 방지용

    const clientId = "hauhzZ56Y2etqYQpnVZi";
    const redirectUri = " https://963d35bc.hearthunter-3fs.pages.dev/naver/callback"; // React 앱 주소로 수정
    const naverAuthUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
        redirectUri
    )}&state=${state}`;

    const API_BASE = process.env.REACT_APP_API_BASE_URL
    try {
        // 서버에 oauthState 전달
        const response = await fetch(`${API_BASE}/api/setOauthState`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ oauthState: state }),
        });

        if (response.ok) {
            // 네이버 로그인 페이지로 이동
            window.location.href = naverAuthUrl;
        } else {
            console.error("서버로 oauth state 전송 실패");
        }
    } catch (err) {
        console.error("네이버 로그인 요청 중 오류:", err);
    }
};
