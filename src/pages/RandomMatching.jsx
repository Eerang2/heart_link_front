import React, { useState, useEffect, useRef } from "react";
import api from "../api/axiosInstance";
import "../styles/RandomMatching.css";

const MatchingRandom = () => {
    const [profiles, setProfiles] = useState([]);
    const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
    const [imageIndex, setImageIndex] = useState(0);
    const [page, setPage] = useState(0);
    const [animationClass, setAnimationClass] = useState("active");

    // 현재 배치(20명) 백업 + 이미 저장한 배치 페이지 세트
    const lastBatchRef = useRef([]);
    const submittedPagesRef = useRef(new Set()); // ex) 0, 1, 2...

    const currentProfile = profiles[currentProfileIndex];
    const currentImage = currentProfile?.images?.[imageIndex];

    // ====== API ======
    const processProfiles = (rawProfiles) =>
        rawProfiles.map((p) => ({
            ...p,
            images: [p.mainImageUrl, ...(p.subImageUrls || [])].filter(Boolean),
        }));

    // 이전 배치(20명)를 bulk 저장
    const saveHistoryBulk = async (batch, prevPage) => {
        if (!batch?.length) return;
        if (submittedPagesRef.current.has(prevPage)) return; // 중복 방지

        try {
            // 서버가 요구하는 스키마에 맞추세요. 여기선 memberId 배열로 예시.
            const payload = {
                profileIds: batch
                    .map((x) => x.memberId)
                    .filter((v) => v != null),
                page: prevPage,
                count: batch.length,
            };
            await api.post("/api/on/matching/history/bulk", payload);
            submittedPagesRef.current.add(prevPage);
        } catch (e) {
            // 실패 시에도 앱 플로우는 막지 않음(로그만)
            console.error("❌ 히스토리 bulk 저장 실패", e);
        }
    };

    // 다음 페이지 배치를 가져오되, 가져오기 직전에 이전 배치를 bulk 저장
    const fetchProfiles = async (pageNum = 0) => {
        try {
            // pageNum > 0 이면 "이전 페이지(pageNum-1)의 배치"를 저장
            if (pageNum > 0) {
                const prevPage = pageNum - 1;
                const prevBatch = lastBatchRef.current;
                await saveHistoryBulk(prevBatch, prevPage);
            }

            const res = await api.get(`/api/on/matching/recommend?page=${pageNum}`);
            const processed = processProfiles(res.data);

            // 새 배치로 교체
            setProfiles(processed);
            lastBatchRef.current = processed; // 다음 전환 때 저장용
            setCurrentProfileIndex(0);
            setImageIndex(0);
        } catch (err) {
            console.error("❌ 프로필 불러오기 실패", err);
        }
    };

    // 초기/페이지 변경 시 배치 로드
    useEffect(() => {
        fetchProfiles(page);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    // ====== UI 핸들러 ======
    const nextImage = () => {
        if (!currentProfile?.images?.length) return;
        setImageIndex((prev) => (prev + 1) % currentProfile.images.length);
    };

    const prevImage = () => {
        if (!currentProfile?.images?.length) return;
        setImageIndex((prev) =>
            prev === 0 ? currentProfile.images.length - 1 : prev - 1
        );
    };

    const nextProfile = () => {
        setAnimationClass("slide-out-left");

        setTimeout(() => {
            const isLast = currentProfileIndex === profiles.length - 1;
            const isPenultimate = currentProfileIndex === profiles.length - 2;

            if (isLast) return; // 마지막이면 더 이상 넘기지 않음

            // 19번째(= index 18)에서 다음 페이지 미리 로드 트리거
            if (isPenultimate) {
                setPage((prev) => prev + 1);
            }

            setCurrentProfileIndex((prev) => prev + 1);
            setImageIndex(0);
            setAnimationClass("slide-in-right");
            setTimeout(() => setAnimationClass("active"), 200);
        }, 300);
    };

    const handleChatRequest = async () => {
        try {
            const memberId = currentProfile?.memberId;
            if (!memberId) {
                alert("유효한 상대 정보가 없습니다.");
                return;
            }
            await api.post(`/api/on/matching/request/${memberId}`);
            alert("채팅 신청이 완료되었습니다!");
        } catch (err) {
            console.error("❌ 채팅 신청 실패", err);
            alert("채팅 신청 중 오류가 발생했습니다.");
        }
    };

    // 키보드로 다음 사람
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "ArrowRight") nextProfile();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
        // profiles/currentProfileIndex 가 바뀌면 최신 핸들러 유지
    }, [profiles, currentProfileIndex]);

    if (!currentProfile) return <div>🔄 프로필 로딩 중...</div>;

    return (
        <div className="matching-container">
            <div className={`matching-card ${animationClass}`}>
                <div className="matching-card-content">
                    <div className="profile-image-container">
                        <img src={currentImage} alt="profile" />
                        <button onClick={prevImage} className="image-nav-button left">◀</button>
                        <button onClick={nextImage} className="image-nav-button right">▶</button>
                    </div>

                    <h2 className="profile-name">{currentProfile.name}</h2>
                    <span className="profile-hobbies">{currentProfile.age} 세</span>
                    <span className="profile-location">{currentProfile.location}</span>

                    <div className="profile-hobbies">
                        {currentProfile.interests?.map((hobby, idx) => (
                            <span key={idx} className="hobby-tag">#{hobby}</span>
                        ))}
                    </div>

                    <div className="profile-actions">
                        <button className="secondary-btn">👀 이 사람 정보 보기</button>
                        <button className="primary-btn" onClick={handleChatRequest}>
                            💬 채팅 신청하기
                        </button>
                    </div>
                </div>
            </div>

            <button className="next-btn" onClick={nextProfile}>
                👉 다음 사람 보기
            </button>
        </div>
    );
};

export default MatchingRandom;
