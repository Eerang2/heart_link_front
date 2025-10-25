// src/pages/admin/AdminDashboard.jsx
import React from "react";

const AdminDashboard = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">관리자 대시보드</h1>
      <p className="text-gray-600">환영합니다! 👋 관리자 기능을 선택해 주세요.</p>

      {/* 향후 통계 정보, 최근 신고, 시스템 상태 등 추가 가능 */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-white shadow p-4 rounded">
          <h3 className="font-semibold">총 가입자 수</h3>
          <p className="text-xl mt-2">📈 1,204명</p>
        </div>
        <div className="bg-white shadow p-4 rounded">
          <h3 className="font-semibold">이번 주 신고 수</h3>
          <p className="text-xl mt-2">🚨 13건</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
