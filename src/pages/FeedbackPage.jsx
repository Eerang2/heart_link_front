import React, { useEffect, useState, useCallback, memo } from "react";
import adminApi from "../api/adminApi";

/** 1행 컴포넌트: props가 같으면 리렌더 안 되도록 memo */
const FeedbackRow = memo(function FeedbackRow({ item }) {
    return (
        <tr>
            <td>{item.id}</td>
            {/* user 필드 형태가 백엔드 응답에 따라 다를 수 있어 안전하게 표기 */}
            <td>{item.user?.name ?? item.memberKey ?? item.user ?? "-"}</td>
            <td>{item.title}</td>
            <td className="feedback-message-cell">{item.content}</td>
        </tr>
    );
});

const FeedbackPage = () => {
    const [feedback, setFeedback] = useState([]);      // 배열로 초기화
    const [loading, setLoading] = useState(true);      // 로딩 상태
    const [error, setError] = useState(null);          // 에러 상태

    const fetchFeedback = useCallback(async (signal) => {
        try {
            setLoading(true);
            setError(null);

            // axios v1 이상: { signal } 지원
            const res = await adminApi.get("/feedback", { signal });

            // 백엔드에서 페이지네이션이면 content 사용, 아니라면 data 자체 사용
            const list = res?.data?.content ?? res?.data ?? [];
            setFeedback(Array.isArray(list) ? list : []);
        } catch (err) {
            // 요청 취소는 정상 흐름이라 조용히 무시
            if (err?.name === "CanceledError" || err?.name === "AbortError") return;
            console.error("피드백 불러오기 실패:", err);
            setError("피드백을 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        fetchFeedback(controller.signal);
        return () => controller.abort(); // 언마운트 시 요청 취소
    }, [fetchFeedback]);

    return (
        <div className="admin-section">
            <h2>피드백 / 버그 조회</h2>

            {/* 상태별 UI */}
            {loading && <div className="admin-hint">불러오는 중…</div>}
            {error && !loading && <div className="admin-error">{error}</div>}
            {!loading && !error && feedback.length === 0 && (
                <div className="admin-hint">등록된 피드백이 없습니다.</div>
            )}

            {/* 목록 */}
            {!loading && !error && feedback.length > 0 && (
                <table className="admin-table">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>유저</th>
                        <th>유형</th>
                        <th>내용</th>
                    </tr>
                    </thead>
                    <tbody>
                    {feedback.map((item) => (
                        <FeedbackRow key={item.id} item={item} />
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default FeedbackPage;
