// src/pages/admin/UserManagement.jsx
import React, { useEffect, useState } from "react";
import "../../styles/admin/UserManagement.css";
import adminApi from "../../api/adminApi";
import UserDetailModal from "./UserDetailModal";
import UserBanInfoModal from "./UserBanInfoModal";

// 상태 정규화: status 우선, 없으면 allow=false → BANNED, 기본 ACTIVE
const normStatus = (u) => {
  const raw = u?.status
      ? String(u.status).toUpperCase()
      : (u?.allow === false ? "BANNED" : "ACTIVE");
  return raw === "BAN" ? "BANNED" : raw;
};

const UserManagement = () => {
  const [detailUser, setDetailUser] = useState(null);
  const [banUser, setBanUser] = useState(null);

  const [users, setUsers] = useState([]);
  const load = React.useCallback(async () => {
    try {
      const res = await adminApi.get("/admin/users");
      setUsers(res.data?.content ?? res.data ?? []);
    } catch (e) {
      console.error("유저 불러오기 실패", e);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
      <div className="admin-section">
        <h2>유저 관리</h2>

        <table className="admin-table">
          <thead>
          <tr>
            <th>ID</th>
            <th>상태</th>
            <th>이름</th>
            <th>이메일</th>
            <th>성별</th>
            <th>나이</th>
            <th>공개여부</th>
            <th>가입방식</th>
            <th>찾는 성별</th>
            <th>생년월일</th>
            <th>액션</th>
          </tr>
          </thead>
          <tbody>
          {users.length === 0 ? (
              <tr>
                <td colSpan={11} style={{ textAlign: "center", padding: 16 }}>
                  유저가 없습니다.
                </td>
              </tr>
          ) : (
              users.map((u) => {
                const status = normStatus(u);
                const isBanned = status === "BANNED";
                return (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td>{status}</td>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.gender}</td>
                      <td>{u.age}</td>
                      <td>{u.openAge ? "공개" : "비공개"}</td>
                      <td>{u.providerType}</td>
                      <td>{u.lookingFor}</td>
                      <td>{u.birth}</td>
                      <td className="actions-cell">
                        <button
                            onClick={() => setDetailUser(u)}
                            className="um-btn um-btn--detail"
                            title="상세 보기"
                        >
                          🔎 <span>상세</span>
                        </button>

                        {isBanned && (
                            <button
                                style={{marginLeft: 8}}
                                onClick={() => setBanUser(u)}
                                className="um-btn um-btn--reason"
                                title="차단 사유"
                            >
                              🚫 <span>차단 사유</span>
                            </button>
                        )}
                      </td>
                    </tr>
                );
              })
          )}
          </tbody>
        </table>

        {detailUser && (
            <UserDetailModal
                user={detailUser}
                onClose={() => setDetailUser(null)}
                onUpdated={(u) => setUsers(prev => prev.map(x => x.id === u.id ? u : x))}
                onRefresh={load}
            />
        )}

        {banUser && (
            <UserBanInfoModal
                user={banUser}
                onClose={() => setBanUser(null)}
            />
        )}
      </div>
  );
};

export default UserManagement;
