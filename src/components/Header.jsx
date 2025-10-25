import React, { useState } from "react";
import api from "../api/axiosInstance";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Header.css";
import FeedbackModal from "../pages/FeedbackModal"; // ✅ 모달 임포트

const logo = "/images/ONDALogo.png";

const Header = () => {
    const { logout } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // ✅ 피드백 모달 열림 상태
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

    const handleLogout = async () => {
        try {
            const response = await api.post("/api/logout");
            if (response.status === 200) {
                document.cookie = "refreshToken=; max-age=0; path=/;";
                logout();
                window.location.href = "/";
            }
        } catch (err) {
            console.error("로그아웃 실패:", err);
        }
    };

    return (
        <>
            <nav className="navbar header-flex">
                <div className="left-logo">
                    <Link to="/main" className="navbar-brand">
                        <img src={logo} alt="logo" className="logo-image" />
                        <span className="logo-text">ON : DA</span>
                    </Link>
                </div>

                <div className="nav-links">
                    <ul className="nav-menu">
                        <li><Link to="/about">소개</Link></li>
                        <li><Link to="/notices">공지사항</Link></li>

                        {/* 드롭다운 메뉴 */}
                        <li
                            className="dropdown"
                            onMouseEnter={() => setIsDropdownOpen(true)}
                            onMouseLeave={() => setIsDropdownOpen(false)}
                        >
                            <span className="dropdown-toggle">매칭 ▾</span>
                            {isDropdownOpen && (
                                <ul className="dropdown-menu">
                                    <li><Link to="/random/matching">랜덤 매칭</Link></li>
                                    <li><Link to="/location/matching">위치기반 매칭</Link></li>
                                </ul>
                            )}
                        </li>

                        <li><Link to="/communityList">커뮤니티</Link></li>
                        <li><Link to="/chatting">채팅</Link></li>

                        {/* 🔻 여기! Link → 버튼으로 바꿔 모달 오픈 */}
                        <li>
                            <button
                                type="button"
                                className="link-button"      // 아래 CSS 참고
                                onClick={() => setIsFeedbackOpen(true)}
                                aria-haspopup="dialog"
                                aria-expanded={isFeedbackOpen}
                            >
                                피드백
                            </button>
                        </li>
                    </ul>

                    <div className="nav-buttons">
                        <Link to="/mypage" className="btn">마이페이지</Link>
                        <button onClick={handleLogout} className="btn">로그아웃</button>
                    </div>
                </div>
            </nav>

            {/* ✅ 모달 마운트 */}
            <FeedbackModal
                open={isFeedbackOpen}
                onClose={() => setIsFeedbackOpen(false)}
                mode="create"
                submitter={({ title, content }) => api.post("/feedback/create", { title, content })}
                onSubmitted={() => console.log("등록 완료")}
            />
        </>
    );
};

export default Header;
