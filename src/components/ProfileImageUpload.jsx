import api from "../api/axiosInstance";
import React, { useEffect, useState } from "react";
const defaultImage = "/images/default-profile.png";

const ProfileImageUpload = ({ images: fetchedImages = [], onUpload }) => {
  const [images, setImages] = useState([null, null, null]);

  // 백엔드에서 불러온 이미지 반영
  useEffect(() => {
    if (fetchedImages.length > 0) {
      const loaded = [null, null, null];
      fetchedImages.forEach((img) => {
        if (img.role === "MAIN") {
          loaded[0] = img.url;
        } else if (img.role === "SUB") {
          const next = loaded[1] ? 2 : 1;
          loaded[next] = img.url;
        }
      });
      setImages(loaded);
    }
  }, [fetchedImages]);

  const handleImageChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const newImages = [...images];
      newImages[index] = URL.createObjectURL(file); // 미리보기용
      setImages(newImages);
    }
  };


  const handleDelete = async (index) => {
    const targetUrl = images[index];
    if (!targetUrl) return;

    const confirmed = window.confirm("정말 이미지를 삭제하시겠습니까?");
    if (!confirmed) return;

    try {
      await api.delete("/api/on/mypage/profile-images", {
        params: { url: targetUrl },
      });

      // 삭제 후 프론트 상태 업데이트
      const newImages = [...images];
      newImages[index] = null;
      setImages(newImages);
    } catch (err) {
      console.error("이미지 삭제 실패:", err);
      alert("이미지 삭제에 실패했습니다.");
    }
  };

  return (
    <form onSubmit={onUpload}>
      <div className="profile-section">
        <h2>프로필 이미지 수정</h2>

        <div className="preview-circle">
          <img src={images[0] || defaultImage} alt="대표 이미지 미리보기" />
        </div>

        <div className="image-upload-grid">
          {[0, 1, 2].map((index) => (
            <div key={index} className="image-upload-item">
              <p className="image-label">{index === 0 ? "대표 이미지" : `서브 이미지 ${index}`}</p>

              <label htmlFor={`upload-${index}`}>
                <img
                  src={images[index] || defaultImage}
                  alt={`이미지 ${index + 1}`}
                  className="upload-image"
                />
              </label>
              <input
                type="file"
                id={`upload-${index}`}
                name={index === 0 ? "mainImage" : "subImages"}
                accept="image/*"
                onChange={(e) => handleImageChange(index, e)}
                hidden
                multiple={index !== 0}
              />

              {images[index] && (
                <button type="button" onClick={() => handleDelete(index)} className="delete-btn">
                  삭제
                </button>
              )}
            </div>
          ))}
        </div>

        <button type="submit">이미지 저장</button>
      </div>
    </form>
  );
};

export default ProfileImageUpload;
