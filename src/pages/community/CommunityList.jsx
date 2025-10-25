import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import "../../styles/community/CommunityList.css";
import CommunityDetail from "./CommunityDetail";

const CATEGORIES = ["자유", "후기", "데이트코스추천"];

const fmt = (iso) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}`;
};

const FeedCard = ({ post, onClick }) => (
  <article className="feed-card" onClick={() => onClick?.(post)}>
    <div className="feed-card__header">
      <img
        className="avatar"
        src={post.profileUrl}
        alt={post.name}
        onError={(e) => e.currentTarget.classList.add("avatar--hidden")}
      />
      <div className="meta">
        <strong className="name">{post.name}</strong>
        <time className="time">{fmt(post.createdAt)}</time>
      </div>
    </div>
    <h3 className="title clamp-2">{post.title}</h3>
    <p className="content clamp-3">{post.content}</p>

    {/* ✅ 이미지 썸네일 */}
    {post.imageUrl && (
      <div className="thumb-wrap">
        <img className="thumb" src={post.imageUrl} alt="preview" />
      </div>
    )}

    <div className="feed-card__footer">
      <span>❤️ {post.likes ?? 0}</span>
      <span>💬 {post.comments ?? 0}</span>
      <span>👁️ {post.views ?? 0}</span>
    </div>
  </article>
);

function CommunityList() {
  const navigate = useNavigate();
  const [active, setActive] = useState("자유");
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await api.get("/api/on/community/posts");
        const apiPosts = res.data.map((p) => ({
          id: p.id,
          category: mapCategory(p.category),
          name: p.writerName,
          profileUrl: p.writerProfileImageUrl || "/images/default-profile.png",
          title: p.title,
          content: p.content,
          createdAt: p.createdAt,
          views: p.views ?? 0,
          likes: p.likes ?? 0,
          comments: p.commentsCount ?? 0,
          imageUrl: p.imageUrl ? `http://localhost:8080${p.imageUrl}` : null
        }));
        setPosts(apiPosts);
      } catch (err) {
        console.error("게시글 불러오기 실패:", err);
      }
    };
    fetchPosts();
  }, []);

  const mapCategory = (val) => {
    switch (val) {
      case "FREE":
        return "자유";
      case "REVIEW":
        return "후기";
      case "COURSE":
        return "데이트코스추천";
      default:
        return val;
    }
  };

  const filtered = useMemo(() => {
    return posts.filter((p) => p.category === active).sort((a, b) => b.id - a.id);
  }, [posts, active]);

  return (
    <div className="community-page">
      <style>{`.clamp-2{-webkit-line-clamp:2}.clamp-3{-webkit-line-clamp:3}.clamp-2,.clamp-3{display:-webkit-box;-webkit-box-orient:vertical;overflow:hidden}`}</style>

      <div className="community-tabs">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            className={`tab-btn ${active === c ? "active" : ""}`}
            onClick={() => setActive(c)}
          >
            #{c}
          </button>
        ))}
      </div>

      <div className="feed">
        {filtered.length === 0 ? (
          <div className="empty">아직 글이 없어요.</div>
        ) : (
          filtered.map((p) => <FeedCard key={p.id} post={p} onClick={setSelectedPost} />)
        )}
      </div>

      {/* 디테일 모달 */}
      {selectedPost && (
        <CommunityDetail post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}

      <button
        className="floating-write-btn"
        onClick={() => navigate("/communityWrite")}
      >
        ✍️
      </button>
    </div>
  );
}

export default CommunityList;
