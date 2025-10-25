import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import UserManagement from "../../pages/admin/UserManagement";
import CommunityManagement from "../../pages/admin/CommunityManagement";
import NoticeForm from "../../pages/admin/NoticeForm";
import ReportedUsers from "../../pages/admin/ReportedUsers";
import AdminDashboard from "../../pages/admin/AdminDashboard";
import FeedbackPage from "../../pages/FeedbackPage";
import NoticeList from "../../pages/NoticeList";
const AdminRoutes = () => {
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch("http://localhost:8080/admin/check", {
          credentials: "include",
        });
        const data = await res.json();
        setIsAdmin(data.isAdmin);
      } catch {
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, []);

  if (isAdmin === null) return <div>로딩 중...</div>;
  if (!isAdmin) return <Navigate to="/admin/login" />;

  return (
    <Routes>
      <Route path="" element={<AdminLayout />}>
        <Route path="users" element={<UserManagement />} />
        <Route path="community" element={<CommunityManagement />} />
        <Route path="notice" element={<NoticeForm />} />
        <Route path="reports" element={<ReportedUsers />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="notice" element={<NoticeForm />} />
        <Route path="notices" element={<NoticeList />} />
        <Route path="notice/edit/:id" element={<NoticeForm />} />
        <Route path="feedback" element={<FeedbackPage />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
