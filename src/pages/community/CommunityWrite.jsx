import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import "../../styles/community/CommunityWrite.css";

const CATEGORIES = [
  { value: "REVIEW", label: "후기" },
  { value: "FREE", label: "자유" },
  { value: "COURSE", label: "데이트코스추천" },
];

function CommunityWrite() {
  const navigate = useNavigate();
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null); // ✅ 이미지 파일 상태
  const [preview, setPreview] = useState(null); // ✅ 미리보기 URL
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const remaining = useMemo(() => 5000 - content.length, [content]);

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
      if (image) formData.append("image", image); // ✅ 이미지 파일 포함

      await api.post("/api/on/community/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate("/communityList");
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "등록 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="community-write-page">
      <div className="community-write-container">
        <div className="community-write-header">
          <h1 className="community-write-title">글쓰기</h1>
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
              form="community-write-form"
              disabled={submitting}
              className={`btn-primary ${submitting ? "disabled" : ""}`}
            >
              {submitting ? "등록 중..." : "등록"}
            </button>
          </div>
        </div>

        <form
          id="community-write-form"
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
                  className={`category-tab ${
                    category === c.value ? "active" : ""
                  }`}
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
              placeholder="내용을 입력하세요 (사진 첨부는 1장 지원)"
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

          <div className="form-col">
            <label className="form-label">이미지 (1장)</label>
            <div className="image-upload-box">
              {preview ? (
                <img src={preview} alt="미리보기" className="image-preview" />
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

export default CommunityWrite;
