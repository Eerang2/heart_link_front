import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axiosInstance";
import "../../styles/community/CommunityWrite.css";

const CATEGORIES = [
  { value: "REVIEW", label: "후기" },
  { value: "FREE", label: "자유" },
  { value: "COURSE", label: "데이트코스추천" },
];

function CommunityEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const remaining = useMemo(() => 5000 - content.length, [content]);

  // 기존 게시글 불러오기
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await api.get(`/api/on/community/posts/${id}`);
        setCategory(res.data.category);
        setTitle(res.data.title);
        setContent(res.data.content);
        if (res.data.imageUrl) {
          setExistingImage(`http://localhost:8080${res.data.imageUrl}`);
        }
      } catch (err) {
        console.error("게시글 불러오기 실패:", err);
        setError("게시글을 불러오지 못했습니다.");
      }
    };
    fetchPost();
  }, [id]);

  const validate = () => {
    if (!category) return "카테고리를 선택해주세요.";
    if (!title.trim()) return "제목을 입력해주세요.";
    if (content.trim().length < 5) return "내용을 5자 이상 입력해주세요.";
    if (content.length > 5000) return "내용은 5000자 이하로 작성해주세요.";
    return "";
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const payload = {
        category,
        title: title.trim(),
        content: content.trim(),
      };

      const formData = new FormData();
      formData.append(
        "request",
        new Blob([JSON.stringify(payload)], { type: "application/json" })
      );
      if (image) {
        formData.append("image", image);
      }

      await api.put(`/api/on/community/posts/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate("/communityList");
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "수정 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="community-write-page">
      <div className="community-write-container">
        <div className="community-write-header">
          <h1 className="community-write-title">글 수정</h1>
          <div className="community-write-header-actions">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary"
            >
              취소
            </button>
            <button
              type="submit"
              form="community-edit-form"
              disabled={submitting}
              className={`btn-primary ${submitting ? "disabled" : ""}`}
            >
              {submitting ? "수정 중..." : "수정"}
            </button>
          </div>
        </div>

        <form
          id="community-edit-form"
          onSubmit={handleSubmit}
          className="community-write-form"
        >
          <div className="form-row">
            <label className="form-label">카테고리</label>
            <div className="category-tabs">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCategory(c.value)}
                  className={`category-tab ${category === c.value ? "active" : ""}`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-col">
            <label className="form-label">제목</label>
            <input
              type="text"
              placeholder="제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              className="form-input"
            />
            <div className="form-hint">{title.length}/120</div>
          </div>

          <div className="form-col">
            <label className="form-label">내용</label>
            <textarea
              placeholder="내용을 입력하세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={14}
              className="form-textarea"
            />
            <div className="form-hint right">
              {remaining < 0 ? (
                <span className="over-limit">{remaining}</span>
              ) : (
                remaining
              )}{" "}
              / 5000
            </div>
          </div>

          {/* ✅ 이미지 수정 */}
          <div className="form-col">
            <label className="form-label">이미지 (1장)</label>
            <div className="image-upload-box">
              {preview ? (
                <img src={preview} alt="미리보기" className="image-preview" />
              ) : existingImage ? (
                <img src={existingImage} alt="기존 이미지" className="image-preview" />
              ) : (
                <span className="image-placeholder">이미지를 선택하세요</span>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="image-input"
              />
            </div>
          </div>

          {error && <div className="error-box">{error}</div>}
        </form>
      </div>
    </div>
  );
}

export default CommunityEdit;
