import React, { useState, useEffect } from "react";
import api from "../../api/axiosInstance";
import "../../styles/community/CommunityDetail.css";

function CommunityDetail({ post, onClose }) {
  const [postData, setPostData] = useState(post);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post ? post.likes ?? 0 : 0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const token = localStorage.getItem("accessToken");
  const currentUserId = token
    ? Number(JSON.parse(atob(token.split(".")[1])).sub)
    : null;

  // 게시글 조회수 증가 + 최신 데이터 불러오기
  useEffect(() => {
    const fetchPostWithView = async () => {
      if (!post?.id) return;
      try {
        await api.post(`/api/on/community/${post.id}/view`);
        const res = await api.get(`/api/on/community/posts/${post.id}`);
        setPostData(res.data);
        setLikeCount(res.data.likes);
      } catch (err) {
        console.error("조회수 증가/게시글 불러오기 실패:", err);
      }
    };
    fetchPostWithView();
  }, [post]);

  // 내가 좋아요 눌렀는지 확인
  useEffect(() => {
    const fetchLikeStatus = async () => {
      if (!post?.id) return;
      try {
        const res = await api.get(`/api/on/community/${post.id}/like/status`);
        setLiked(res.data);
      } catch (err) {
        console.error("좋아요 상태 확인 실패:", err);
      }
    };
    fetchLikeStatus();
  }, [post]);

  // 댓글 조회
  useEffect(() => {
    const fetchComments = async () => {
      if (!post?.id) return;
      try {
        const res = await api.get(`/api/on/community/posts/${post.id}/comments`);
        setComments(res.data);
      } catch (err) {
        console.error("댓글 불러오기 실패:", err);
      }
    };
    fetchComments();
  }, [post]);

  if (!postData) return null;

  // 좋아요 토글
  const toggleLike = async () => {
    try {
      await api.post(`/api/on/community/${postData.id}/like`);
      const [countRes, statusRes] = await Promise.all([
        api.get(`/api/on/community/${postData.id}/like/count`),
        api.get(`/api/on/community/${postData.id}/like/status`)
      ]);
      setLikeCount(countRes.data);
      setLiked(statusRes.data);
    } catch (err) {
      console.error("좋아요 토글 실패:", err);
    }
  };

  // 댓글 작성
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await api.post(
        `/api/on/community/posts/${postData.id}/comments`,
        newComment,
        { headers: { "Content-Type": "text/plain" } }
      );
      setComments((prev) => [...prev, res.data]);
      setNewComment("");
    } catch (err) {
      console.error("댓글 작성 실패:", err);
      alert("댓글 작성 실패");
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("정말 댓글을 삭제하시겠습니까?")) return;
    try {
      await api.delete(
        `/api/on/community/posts/${postData.id}/comments/${commentId}`
      );
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error("댓글 삭제 실패:", err);
      alert("댓글 삭제 실패");
    }
  };

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-card" onClick={(e) => e.stopPropagation()}>
        <button className="detail-close" onClick={onClose}>
          ✖
        </button>

        {/* 헤더 */}
        <div className="detail-header">
          <img
            src={postData.writerProfileImageUrl || "/images/default-profile.png"}
            alt={postData.writerName}
            className="avatar"
          />
          <div className="meta">
            <span className="name">{postData.writerName}</span>
            <time className="time">
              {new Date(postData.createdAt).toLocaleString()}
            </time>
          </div>
        </div>

        {/* 본문 */}
        <h2 className="detail-title">{postData.title}</h2>
        <p className="detail-content">{postData.content}</p>

        {/* 이미지 */}
        {postData.imageUrl && (
          <div className="detail-image-wrap">
            <img
              src={`http://localhost:8080${postData.imageUrl}`}
              alt="preview"
              className="detail-image"
            />
          </div>
        )}

        {postData.writerId === currentUserId && (
          <div className="detail-actions">
            <button
              className="edit-btn"
              onClick={() => (window.location.href = `/community/edit/${postData.id}`)}
            >
              수정
            </button>
            <button
              className="delete-btn"
              onClick={async () => {
                if (!window.confirm("정말 이 글을 삭제하시겠습니까?")) return;
                try {
                  await api.delete(`/api/on/community/posts/${postData.id}`);
                  alert("삭제되었습니다.");
                  window.location.href = "/communityList";
                } catch (err) {
                  console.error("삭제 실패:", err);
                  alert("삭제 실패");
                }
              }}
            >
              삭제
            </button>
          </div>
        )}

        {/* 푸터 */}
        <div className="detail-footer">
          <button
            className={`like-btn ${liked ? "liked" : ""}`}
            onClick={toggleLike}
          >
            {liked ? "❤️ 좋아요 취소" : "🤍 좋아요"}
          </button>
          <span className="like-count">❤️ {likeCount}</span>
          <span>💬 {comments.length}</span>
          <span>👁️ {postData.views ?? 0}</span>
        </div>

        {/* 댓글 */}
        <div className="detail-comments">
          <h4>댓글</h4>
          {comments.length === 0 ? (
            <p className="no-comments">아직 댓글이 없어요.</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="comment">
                <img
                  src={c.writerProfileImageUrl || "/images/default-profile.png"}
                  alt="프로필"
                  className="comment-avatar"
                />
                <div className="comment-body">
                  <div className="comment-header">
                    <span className="comment-author">
                      {c.writerId === currentUserId ? "나" : c.writerName}
                    </span>
                    <span className="comment-time">
                      {new Date(c.createdAt).toLocaleString()}
                    </span>
                    {c.writerId === currentUserId && (
                      <button
                        className="comment-delete-btn"
                        onClick={() => handleDeleteComment(c.id)}
                      >
                        삭제
                      </button>
                    )}
                  </div>
                  <span className="comment-text">{c.content}</span>
                </div>
              </div>
            ))
          )}

          <div className="comment-input">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글을 입력하세요..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAddComment();
                }
              }}
            />
            <button onClick={handleAddComment}>등록</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommunityDetail;