import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import adminApi from "../api/adminApi";
import "../styles/NoticeList.css"; // ✅ 추가

const NoticeList = () => {
    const [notices, setNotices] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchNotices = async () => {
            try {
                const res = await adminApi.get("/notices");
                setNotices(res.data);
            } catch (err) {
                console.error("공지사항 불러오기 에러:", err);
                alert("공지사항을 불러오지 못했습니다.");
            }
        };

        const checkAdmin = async () => {
            try {
                const res = await adminApi.get("/admin/check");
                setIsAdmin(Boolean(res.data?.isAdmin));
            } catch (e) {
                setIsAdmin(false);
            }
        };

        fetchNotices();
        checkAdmin();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return;
        try {
            await adminApi.patch(`/notices/${id}/delete`);
            alert("삭제 성공");
            setNotices((prev) => prev.filter((n) => n.id !== id));
        } catch (e) {
            console.error("삭제 중 오류:", e);
            alert("삭제 실패");
        }
    };

    return (
        <div>
            <Header />
            <div className="community-page">
                <main className="community-content notice-container"> {/* ✅ 컨테이너 적용 */}
                    <div className="notice-header">
                        <h2>공지사항</h2>
                    </div>

                    <section className="notice-list">
                        {notices.length === 0 ? (
                            <div className="empty">등록된 공지사항이 없습니다.</div>
                        ) : (
                            notices.map((notice) => (
                                <article key={notice.id} className="notice-card">
                                    <h3 className="notice-title">
                                        <button onClick={() => navigate(`/notices/${notice.id}`)}>
                                            {notice.title}
                                        </button>
                                    </h3>
                                    <div className="notice-meta">
                                        작성일:&nbsp;
                                        {notice.createdAt
                                            ? new Date(notice.createdAt).toLocaleDateString("ko-KR", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })
                                            : "-"}
                                    </div>

                                    {isAdmin && (
                                        <div className="notice-actions">
                                            <button
                                                onClick={() => navigate(`/admin/notice/edit/${notice.id}`)}
                                                className="btn btn-edit"
                                            >
                                                수정
                                            </button>
                                            <button
                                                onClick={() => handleDelete(notice.id)}
                                                className="btn btn-delete"
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    )}
                                </article>
                            ))
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
};

export default NoticeList;
