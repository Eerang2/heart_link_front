// src/pages/admin/ReportManagement.jsx
import React, { useEffect, useState } from "react";
import "../../styles/admin/UserManagement.css";
import adminApi from "../../api/adminApi";

// 날짜/상태 유틸
const fmt = (s) => (s ? s.replace("T", " ").split(/[.,Z]/)[0] : "-");
const up  = (v) => (v ? String(v).toUpperCase() : "-");

// ====== 모달: 특정 회원의 신고 목록 ======
const MemberReportModal = ({ memberId, name, onClose }) => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    const loadReports = async () => {
        try {
            setLoading(true);
            setErr("");
            // ✅ 상세: /reports/{memberId}
            const res  = await adminApi.get(`/admin/reports/${memberId}`);
            const list = res?.data?.content ?? res?.data ?? [];
            setRows(Array.isArray(list) ? list : []);
        } catch (e) {
            console.error(e);
            setErr("신고 내역을 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (memberId) loadReports();}, [memberId]);

    const accept = async (r) => {
        if (!window.confirm(`신고 #${r.id} 수락(처리)할까요?`)) return;
        try {
            const res = await adminApi.patch(`/admin/reports/${r.id}/accept`, {});
            const updated = res?.data ?? { ...r, status: "ACCEPTED", reportedAt: new Date().toISOString() };
            setRows((prev) => prev.map((x) => (x.id === r.id ? updated : x)));
        } catch (e) {
            console.error(e);
            alert("수락 처리 실패");
        }
    };

    const reject = async (r) => {
        if (!window.confirm(`신고 #${r.id} 거절할까요?`)) return;
        try {
            const res = await adminApi.patch(`/admin/reports/${r.id}/reject`, {});
            const updated = res?.data ?? { ...r, status: "REJECTED", reportedAt: new Date().toISOString() };
            setRows((prev) => prev.map((x) => (x.id === r.id ? updated : x)));
        } catch (e) {
            console.error(e);
            alert("거절 처리 실패");
        }
    };

    const short = (v, n = 40) => (v && v.length > n ? v.slice(0, n) + "..." : v || "-");

    return (
        <div className="modal-overlay">
            <div className="modal-box">
                <h3>신고 내역 — 회원 {name ? `${name} (ID:${memberId})` : `ID:${memberId}`}</h3>

                {loading ? (
                    <p>불러오는 중...</p>
                ) : err ? (
                    <p style={{ color: "crimson" }}>{err}</p>
                ) : rows.length === 0 ? (
                    <p>해당 회원의 신고 내역이 없습니다.</p>
                ) : (
                    <table className="admin-table" style={{ marginTop: 8 }}>
                        <thead>
                        <tr>
                            <th>신고ID</th>
                            <th>상태</th>
                            <th>유형</th>
                            <th>신고자ID</th>
                            <th>대상ID</th>
                            <th>채팅방ID</th>
                            <th>사유</th>
                            <th>신고시각</th>
                            <th>처리시각</th>
                            <th>액션</th>
                        </tr>
                        </thead>
                        <tbody>
                        {rows.map((r) => {
                            const st = up(r.status);
                            const isPending = st === "PENDING";
                            return (
                                <tr key={r.id}>
                                    <td>{r.id}</td>
                                    <td>{st}</td>
                                    <td>{up(r.reportType)}</td>
                                    <td title={`ID: ${r.memberId}`}>{r.reporterName ?? r.memberId}</td>
                                    <td title={`ID: ${r.targetId}`}>{r.targetName ?? r.targetId}</td>
                                    <td>{r.chatroomId}</td>
                                    <td title={r.content || "-"}>{short(r.content)}</td>
                                    <td>{fmt(r.createdAt)}</td>
                                    <td>{fmt(r.reportedAt)}</td>
                                    <td>
                                        {isPending ? (
                                            <>
                                                <button onClick={() => accept(r)}>수락</button>
                                                <button style={{ marginLeft: 6 }} onClick={() => reject(r)}>거절</button>
                                            </>
                                        ) : (
                                            <span>-</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                )}

                <div className="modal-actions">
                    <button className="close-btn" onClick={onClose}>닫기</button>
                </div>
            </div>
        </div>
    );
};

// ====== 페이지: 처음엔 유저 목록만 ======
const ReportManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [focusMember, setFocusMember] = useState(null); // {id, name}

    const loadUsers = async () => {
        try {
            setLoading(true);
            setErr("");
            // ✅ 초기: /admin/users
            const res  = await adminApi.get("/admin/userReportInfo");
            const list = res?.data?.content ?? res?.data ?? [];
            setUsers(Array.isArray(list) ? list : []);
        } catch (e) {
            console.error(e);
            setErr("유저 목록을 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadUsers(); }, []);

    const cell = (v) => (v ?? "-");
    // 서버가 reportCount 내려주면 사용, 없으면 0 표시

    return (
        <div className="admin-section">
            <h2>신고 접수</h2>

            <table className="admin-table">
{/*
                // 신고 누적(수락) 옆에 미확인(대기) 추가
*/}
                <thead>
                <tr>
                    <th>회원ID</th>
                    <th>이름</th>
                    <th>이메일</th>
                    <th>성별</th>
                    <th>나이</th>
                    <th>가입방식</th>
                    <th>신고 누적(수락)</th>
                    <th>미확인(대기)</th>   {/* ✅ 추가 */}
                    <th>액션</th>
                </tr>
                </thead>

                <tbody>
                {loading ? (
                    <tr><td colSpan={8} style={{ textAlign: "center", padding: 16 }}>불러오는 중...</td></tr>
                ) : err ? (
                    <tr><td colSpan={8} style={{ color: "crimson", padding: 16 }}>{err}</td></tr>
                ) : users.length === 0 ? (
                    <tr><td colSpan={8} style={{ textAlign: "center", padding: 16 }}>유저가 없습니다.</td></tr>
                ) : (
                    users.map((u) => (
                        <tr key={u.id}>
                            <td>{u.id}</td>
                            <td>{cell(u.name)}</td>
                            <td>{cell(u.email)}</td>
                            <td>{cell(u.gender)}</td>
                            <td>{cell(u.age)}</td>
                            <td>{cell(u.providerType)}</td>
                            <td>{u.reportAcceptedCount ?? 0}</td>
                            <td>{u.reportPendingCount ?? 0}</td>  {/* ✅ 추가 */}
                            <td>
                                <button onClick={() => setFocusMember({ id: u.id, name: u.name })}>
                                    신고 확인
                                </button>
                            </td>
                        </tr>
                    ))
                )}
                </tbody>
            </table>

            {focusMember && (
                <MemberReportModal
                    memberId={focusMember.id}
                    name={focusMember.name}
                    onClose={() => setFocusMember(null)}
                />
            )}
        </div>
    );
};

export default ReportManagement;
