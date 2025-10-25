// src/components/ProfileModal.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ProfileModel.css";
import api from "../api/axiosInstance";

// 서버가 ENUM(대문자)으로 받는 경우 안전 매핑
const REASON_MAP = {
    spam: "SPAM",
    abuse: "ABUSE",
    fraud: "FRAUD",
    inappropriate: "INAPPROPRIATE",
    impersonation: "IMPERSONATION",
    other: "OTHER",
};

const ProfileModal = ({
                          open,
                          onClose,
                          profile,            // { memberId, name, age, location, images[], interests[] }
                          hearted = false,     // 현재 관심(하트) 상태
                          onToggleHeart,       // (payload) => void  (옵션: 토글 성공시 콜백)
                          onReportSubmit,      // (type, content) => Promise<void> | void
                          onGoProfile,         // () => void (라우팅 또는 페이지 이동)
                          currentUserId,       // 보낸 사람 ID (미전달 시 localStorage.memberId 사용)
                      }) => {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState("profile"); // 'profile' | 'report'
    const [imageIndex, setImageIndex] = useState(0);
    const [fitContain, setFitContain] = useState(false); // false: cover, true: contain
    const [reportType, setReportType] = useState("");
    const [reportContent, setReportContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 하트 상태를 내부에서 동기화하여 낙관적 UI 처리
    const [isHearted, setIsHearted] = useState(hearted);
    const [isHeartLoading, setIsHeartLoading] = useState(false);

    useEffect(() => {
        if (open) {
            setViewMode("profile");
            setImageIndex(0);
            setFitContain(false);
            setReportType("");
            setReportContent("");
        }
    }, [open]);

    useEffect(() => {
        setIsHearted(hearted);
    }, [hearted]);

    useEffect(() => {
        if (!open) return;
        const onKey = (e) => {
            if (viewMode === "profile") {
                if (e.key === "ArrowRight") nextImage();
                if (e.key === "ArrowLeft") prevImage();
            }
            if (e.key === "Escape") onClose?.();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, viewMode, imageIndex, onClose]);

    if (!open || !profile) return null;

    const nextImage = () => {
        if (!profile.images?.length) return;
        setImageIndex((i) => (i + 1) % profile.images.length);
    };

    const prevImage = () => {
        if (!profile.images?.length) return;
        setImageIndex((i) => (i === 0 ? profile.images.length - 1 : i - 1));
    };

    // ✅ 보낸사람 ID + 관심대상 ID 함께 전송 (PUT/DELETE)
    const handleToggleHeart = async () => {
        if (isHeartLoading) return;

        const targetId = profile.memberId;

        if (!targetId) {
            alert("필요한 ID 정보가 없습니다. ");
            return;
        }

        const wasHearted = isHearted;
        setIsHearted(!wasHearted); // 낙관적 업데이트
        setIsHeartLoading(true);

        try {
            if (wasHearted) {
                // DELETE는 보디 미지원 서버가 있으므로 쿼리파라미터 사용
                await api.delete(`/api/on/heart/` + targetId, {
                });
            } else {
                // 선호: JSON 보디로 두 ID를 함께 전송
                await api.put(`/api/on/heart/`+ targetId);
                // (백엔드가 경로 파라미터만 받는 경우 예시)
                // await api.put(`/api/on/hearts/${targetId}`, { senderId });
            }

            onToggleHeart?.({ targetId, hearted: !wasHearted });
        } catch (e) {
            console.error("관심 처리 실패:", e);
            setIsHearted(wasHearted); // 롤백
            alert("관심 처리에 실패했습니다. 잠시 후 다시 시도해주세요.");
        } finally {
            setIsHeartLoading(false);
        }
    };

    const submitReport = async () => {
        if (!reportType) {
            alert("신고 유형을 선택해주세요.");
            return;
        }
        if (!reportContent.trim()) {
            alert("신고 내용을 입력해주세요.");
            return;
        }
        try {
            setIsSubmitting(true);
            const mapped = REASON_MAP[reportType] ?? reportType.toUpperCase();
            await onReportSubmit?.(mapped, reportContent);
            setViewMode("profile");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div
            className="pm-overlay"
            onClick={(e) => {
                if (e.target.classList.contains("pm-overlay")) onClose?.();
            }}
        >
            <div className="pm-modal" role="dialog" aria-modal="true">
                <button className="pm-close" onClick={onClose} aria-label="닫기">
                    ✕
                </button>

                {/* 헤더 */}
                <div className="pm-header">
                    <div className="pm-title">
                        {viewMode === "profile" ? "프로필" : "신고 접수"}
                    </div>
                    {viewMode === "profile" && (
                        <div className="pm-header-controls">
                            <button
                                className="pm-chip-btn"
                                onClick={() => setFitContain((v) => !v)}
                                title={fitContain ? "채우기(cover)" : "원본 보기(contain)"}
                            >
                                {fitContain ? "채우기 보기" : "원본 보기"}
                            </button>
                        </div>
                    )}
                </div>

                {/* 본문 */}
                {viewMode === "profile" ? (
                    <div className="pm-body pm-grid">
                        {/* 이미지 섹션 */}
                        <div className="pm-images">
                            <div
                                className={`pm-image-viewer ${fitContain ? "contain" : "cover"}`}
                            >
                                <img src={profile.images?.[imageIndex]} alt="프로필 이미지" />
                            </div>

                            <button className="pm-nav pm-left" onClick={prevImage}>
                                ◀
                            </button>
                            <button className="pm-nav pm-right" onClick={nextImage}>
                                ▶
                            </button>

                            <div className="pm-thumbs">
                                {profile.images?.map((src, i) => (
                                    <button
                                        key={i}
                                        className={`pm-thumb ${i === imageIndex ? "active" : ""}`}
                                        onClick={() => setImageIndex(i)}
                                        aria-label={`thumbnail-${i}`}
                                    >
                                        <img src={src} alt={`thumb-${i}`} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 정보 섹션 */}
                        <div className="pm-info">
                            <div className="pm-name-row">
                                <h2 className="pm-name">{profile.name}</h2>
                                <span className="pm-age">{profile.age}세</span>
                            </div>
                            <div className="pm-location">{profile.location}</div>

                            <div className="pm-tags">
                                {profile.interests?.map((tag, idx) => (
                                    <span key={idx} className="pm-tag">
                    #{tag}
                  </span>
                                ))}
                            </div>

                            <div className="pm-actions">
                                <button
                                    className={`pm-btn pm-btn-outline-primary ${
                                        isHearted ? "aria-pressed" : ""
                                    }`}
                                    onClick={handleToggleHeart}
                                    aria-pressed={isHearted}
                                    title="관심"
                                    disabled={isHeartLoading}
                                >
                                    {isHeartLoading
                                        ? "처리 중..."
                                        : isHearted
                                            ? "💖 관심 해제"
                                            : "🤍 관심"}
                                </button>

                                <button
                                    className="pm-btn pm-btn-outline-danger"
                                    onClick={() => setViewMode("report")}
                                    title="신고"
                                >
                                    🚨 신고
                                </button>

                                <button
                                    className="pm-btn pm-btn-primary"
                                    onClick={
                                        onGoProfile ??
                                        (() => navigate(`/profiles/${profile.memberId}`))
                                    }
                                    title="프로필로 가기"
                                >
                                    👤 프로필로 가기
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    // 신고 접수 화면
                    <div className="pm-report">
                        <div className="pm-report-summary">
                            <img src={profile.images?.[0]} alt="상대" />
                            <div className="pm-report-summary-text">
                                <strong>{profile.name}</strong>
                                <span>
                  {profile.location} · {profile.age}세
                </span>
                            </div>
                        </div>

                        <div className="pm-field">
                            <label className="pm-label">신고 유형</label>
                            <select
                                className="pm-select"
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value)}
                            >
                                <option value="">선택하세요</option>
                                <option value="spam">스팸/광고</option>
                                <option value="abuse">욕설/혐오/괴롭힘</option>
                                <option value="fraud">사기/금전 요구</option>
                                <option value="inappropriate">부적절한 콘텐츠</option>
                                <option value="impersonation">사칭/도용</option>
                                <option value="other">기타</option>
                            </select>
                        </div>

                        <div className="pm-field">
                            <label className="pm-label">신고 내용</label>
                            <textarea
                                className="pm-textarea"
                                value={reportContent}
                                onChange={(e) => setReportContent(e.target.value)}
                                placeholder="상세한 상황, 시점, 증거(대화 내용/스크린샷) 등을 적어주세요."
                                rows={8}
                            />
                        </div>

                        <div className="pm-report-actions">
                            <button
                                className="pm-btn pm-btn-ghost"
                                onClick={() => setViewMode("profile")}
                            >
                                ← 뒤로가기
                            </button>
                            <button
                                className="pm-btn pm-btn-primary"
                                onClick={submitReport}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "전송 중..." : "신고하기"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileModal;
