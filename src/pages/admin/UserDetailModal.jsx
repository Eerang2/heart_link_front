// src/pages/admin/UserDetailModal.jsx
import React, { useState, useMemo, useCallback } from "react";
import "../../styles/admin/UserModal.css";
import adminApi from "../../api/adminApi";

const UserDetailModal = ({ user, onClose, onUpdated }) => {
  // 상태 정규화
  const normalizedStatus = useMemo(() => {
    const raw = (user?.status ?? (typeof user?.allow === "boolean" ? (user.allow ? "ACTIVE" : "BANNED") : "ACTIVE")).toString().toUpperCase();
    return raw === "BAN" ? "BANNED" : raw; // BAN도 BANNED로 통일
  }, [user]);

  const isBanned = normalizedStatus === "BANNED";

  // 밴 폼 상태
  const [isPermanent, setIsPermanent] = useState(true);
  const [untilDate, setUntilDate] = useState(""); // yyyy-MM-dd
  const [untilTime, setUntilTime] = useState(""); // HH:mm
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const statusText = isBanned ? "BANNED(차단)" : normalizedStatus === "INACTIVE" ? "INACTIVE(휴면)" : "ACTIVE(정상)";

  const buildLocalDateTime = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return null;
    return `${dateStr}T${timeStr}:00`; // LocalDateTime 포맷 가정
  };

  const handleBan = useCallback(async () => {
    if (isBanned) return;
    if (!isPermanent && (!untilDate || !untilTime)) {
      alert("임시 차단의 만료 날짜/시간을 입력하세요.");
      return;
    }
    if (!window.confirm("이 사용자를 차단하시겠습니까?")) return;

    try {
      setSaving(true);
      const body = {
        reason: reason?.trim() || undefined,
        until: isPermanent ? null : buildLocalDateTime(untilDate, untilTime),
      };

      // AdminRestController 가정
      const res = await adminApi.patch(`/admin/members/${user.id}/ban`, body);

      alert("차단 완료");
      const updated =
          res?.data ??
          {
            ...user,
            status: "BANNED",
            allow: false,
          };
      onUpdated?.(updated);
      window.location.reload();
      onClose?.();
    } catch (err) {
      console.error(err);
      alert("차단 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  }, [isBanned, isPermanent, untilDate, untilTime, reason, user, onUpdated, onClose]);

  const handleUnban = useCallback(async () => {
    if (!isBanned) return;
    if (!window.confirm("이 사용자의 차단을 해제하시겠습니까?")) return;

    try {
      setSaving(true);

      // AdminRestController 가정
      const res = await adminApi.patch(`/admin/members/${user.id}/unban`);

      alert("차단 해제 완료");
      const updated =
          res?.data ??
          {
            ...user,
            status: "ACTIVE",
            allow: true,
          };
      onUpdated?.(updated);
      window.location.reload();
      onClose?.();

    } catch (err) {
      console.error(err);
      alert("차단 해제 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  }, [isBanned, user, onUpdated, onClose]);

  return (
      <div className="modal-overlay">
        <div className="modal-box">
          <h3>유저 상세 정보</h3>

          {/* 기본 정보 */}
          <div className="modal-section">
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>이름:</strong> {user.name}</p>
            <p><strong>이메일:</strong> {user.email}</p>
            <p><strong>성별:</strong> {user.gender}</p>
            <p><strong>나이:</strong> {user.age}</p>
            <p><strong>공개여부:</strong> {user.openAge ? "공개" : "비공개"}</p>
            <p><strong>가입 방식:</strong> {user.providerType}</p>
            <p><strong>찾는 성별:</strong> {user.lookingFor}</p>
            <p><strong>생년월일:</strong> {user.birth}</p>
            <p><strong>상태:</strong> {statusText}</p>
          </div>

          {/* 차단/해제 영역 */}
          <div className="modal-section">
            {isBanned ? (
                <>
                  <p style={{ marginBottom: 8 }}><strong>현재 상태:</strong> 차단됨</p>
                  <div className="modal-actions">
                    <button
                        onClick={handleUnban}
                        className="primary-btn"
                        disabled={saving}
                    >
                      {saving ? "처리 중..." : "차단 해제"}
                    </button>
                    <button onClick={onClose} className="close-btn" disabled={saving}>
                      닫기
                    </button>
                  </div>
                </>
            ) : (
                <>
                  <p style={{ marginBottom: 8 }}><strong>차단 설정</strong></p>

                  <div style={{ marginBottom: 12 }}>
                    <label style={{ marginRight: 12 }}>
                      <input
                          type="radio"
                          name="banType"
                          checked={isPermanent}
                          onChange={() => setIsPermanent(true)}
                      />{" "}
                      영구 차단
                    </label>
                    <label>
                      <input
                          type="radio"
                          name="banType"
                          checked={!isPermanent}
                          onChange={() => setIsPermanent(false)}
                      />{" "}
                      임시 차단
                    </label>
                  </div>

                  {!isPermanent && (
                      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                        <div>
                          <label className="form-label">만료 날짜</label>
                          <input
                              type="date"
                              value={untilDate}
                              onChange={(e) => setUntilDate(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="form-label">만료 시간</label>
                          <input
                              type="time"
                              value={untilTime}
                              onChange={(e) => setUntilTime(e.target.value)}
                          />
                        </div>
                      </div>
                  )}

                  <div style={{ marginBottom: 12 }}>
                    <label className="form-label">사유 (선택, 최대 200자)</label>
                    <textarea
                        placeholder="욕설/도배 등 사유를 입력하세요"
                        maxLength={200}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={3}
                        style={{ width: "100%" }}
                    />
                  </div>

                  <div className="modal-actions">
                    <button
                        onClick={handleBan}
                        className="danger-btn"
                        disabled={saving}
                    >
                      {saving ? "처리 중..." : "차단"}
                    </button>
                    <button onClick={onClose} className="close-btn" disabled={saving}>
                      닫기
                    </button>
                  </div>
                </>
            )}
          </div>
        </div>
      </div>
  );
};

export default UserDetailModal;
