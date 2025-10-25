// src/pages/admin/UserBanInfoModal.jsx
import React, { useEffect, useState } from "react";
import "../../styles/admin/UserModal.css";
import adminApi from "../../api/adminApi";

// 초간단 날짜 포맷터: "2025-09-03T13:45:12" → "2025-09-03 13:45:12"
const fmt = (s) => (s ? s.replace("T", " ").split(/[.,Z]/)[0] : "-");

const UserBanInfoModal = ({ user, onClose }) => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                setLoading(true);
                setErr("");
                const res = await adminApi.get(`/admin/members/${user.id}/ban-history`);
                const data = res?.data?.content ?? res?.data ?? [];
                if (!cancelled) {
                    // 표시에 필요한 필드만 정리 + 최신순 정렬
                    const normalized = (Array.isArray(data) ? data : []).map((r) => ({
                        at: fmt(r.createdAt || r.bannedAt),
                        action: String(r.action || "BAN").toUpperCase(),
                        reason: r.reason || "-",
                        until: fmt(r.until),
                        admin: r.adminName ? `${r.adminName} (${r.adminId ?? "-"})` : (r.adminId ?? "-"),
                    }));
                    normalized.sort((a, b) => (a.at < b.at ? 1 : -1));
                    setRows(normalized);
                }
            } catch (e) {
                console.error(e);
                if (!cancelled) setErr("차단 내역을 불러오지 못했습니다.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        if (user?.id) load();
        return () => { cancelled = true; };
    }, [user?.id]);
    return (
        <div className="modal-overlay">
            <div className="modal-box baninfo-modal">
                {/* 헤더 */}
                <div className="modal-header">
                    <h3>차단 사유 / 내역 (ID: {user?.id})</h3>
                    <button className="modal-close" onClick={onClose} aria-label="닫기">✕</button>
                </div>

                {/* 본문(스크롤 영역) */}
                <div className="baninfo-body">
                    {loading ? (
                        <p>불러오는 중...</p>
                    ) : err ? (
                        <p style={{ color: "crimson" }}>{err}</p>
                    ) : rows.length === 0 ? (
                        <p>표시할 내역이 없습니다.</p>
                    ) : (
                        <div className="table-wrap">
                            <table className="admin-table" style={{ marginTop: 8 }}>
                                <thead>
                                <tr>
                                    <th>일시</th>
                                    <th>조치</th>
                                    <th>사유</th>
                                    <th>만료(임시)</th>
                                    <th>관리자</th>
                                </tr>
                                </thead>
                                <tbody>
                                {rows.map((r, i) => (
                                    <tr key={`${r.at}-${i}`}>
                                        <td>{r.at}</td>
                                        <td>{r.action}</td>
                                        <td>{r.reason}</td>
                                        <td>{r.until}</td>
                                        <td>{r.admin}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* 푸터 */}
                <div className="modal-footer">
                    <button className="primary-btn" onClick={onClose}>닫기</button>
                </div>
            </div>
        </div>
    );

};

export default UserBanInfoModal;
