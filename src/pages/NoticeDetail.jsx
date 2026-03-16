import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import adminApi from "../api/adminApi"; // axios 인스턴스

const NoticeDetail = () => {
  const { id } = useParams();
  const [notice, setNotice] = useState(null);
  const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState(false);

      const checkAdmin = async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/admin/check`, {
                    credentials: "include",
                });
                const data = await res.json();
                setIsAdmin(data.isAdmin === true);
            } catch (e) {
                setIsAdmin(false);
            }
        };


  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/notices/${id}`, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) throw new Error("공지사항 불러오기 실패");
        const data = await res.json();
        setNotice(data);
      } catch (err) {
        console.error(err);
        alert("공지사항을 불러올 수 없습니다.");
      }
    };
        checkAdmin();

    fetchNotice();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await adminApi.patch(`/notices/${id}/delete`, {
        withCredentials: true,
      });
      alert("삭제되었습니다.");
      navigate("/notices");
    } catch (err) {
      console.error(err);
      alert("삭제 실패");
    }
  };

  if (!notice) return <div>로딩 중...</div>;

  return (
    <div>
        <Header/>
    <div className="community-page">
      <main className="community-content">
        <article className="post">
          <h3>{notice.title}</h3>
          <p>{notice.content}</p>
          <div className="meta">
            작성일:{" "}
            {new Date(notice.createdAt).toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>

          {isAdmin && (
            <div className="admin-actions" style={{ marginTop: "1rem" }}>
              <button
                className="admin-actions edit"
                onClick={() => navigate(`/notices/${id}/update`)}
              >
                ✏️ 수정
              </button>
              <button
                className="admin-actions delete"
                onClick={handleDelete}
                style={{ marginLeft: "0.5rem" }}
              >
                🗑️ 삭제
              </button>
            </div>
          )}
        </article>
      </main>
    </div>
    </div>
  );
};

export default NoticeDetail;

