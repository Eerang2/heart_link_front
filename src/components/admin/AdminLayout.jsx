import { Link, Outlet } from "react-router-dom";
import "../../styles/admin/AdminLayout.css";
import adminApi from "../../api/adminApi";
import {useNavigate } from "react-router-dom";


const AdminLayout = () => {
    const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await adminApi.post("/admin/logout");
      navigate("/admin/login");
    } catch (err) {
      console.error("로그아웃 실패:", err);
      alert("로그아웃에 실패했습니다.");
    }
  };
  
  return (
      <div className="admin-container">
            <aside className="admin-sidebar">
                <h2>관리자</h2>
                <nav>
                    <ul>
                        <li><Link to="/admin/users">유저 관리</Link></li>
                        <li><Link to="/admin/community">커뮤니티 관리</Link></li>
                        <li><Link to="/admin/notice">공지사항 등록</Link></li>
                        <li><Link to="/admin/notices">공지사항 리스트</Link></li>
                        <li><Link to="/admin/reports">신고유저 접수</Link></li>
                        <li><Link to="/admin/feedback">피드백 모음</Link></li>

                        <button
                            onClick={handleLogout}
                            className=""
                        >
                            로그아웃
                        </button>
                    </ul>

                </nav>

            </aside>
          <main className="admin-main">
                <Outlet />
            </main>
           
        </div>
        
  );
};

export default AdminLayout;
