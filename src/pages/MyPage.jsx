import React, {memo, useEffect, useState, useCallback} from "react"; // useCallback 추가(은섭)
import "../styles/MyPage.css";
import ProfileImageUpload from "../components/ProfileImageUpload";
import api from "../api/axiosInstance";
import FeedbackModal from "./FeedbackModal";

// 컴포넌트 상단 어딘가에 유틸 추가
const ellipsisByWords = (text, limit) => {
  if (!text) return "";
  const words = String(text).trim().split(/\s+/);
  return words.length <= limit ? text : words.slice(0, limit).join(" ") + "…";
};

// ✅ 이니셜 추출 (프로필 이미지 없는 경우 원형 아바타에 표기)
const getInitials = (name) => {
  if (!name) return "유저";
  const parts = String(name).trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2);
  return (parts[0][0] || "") + (parts[1][0] || "");
};

const MyPage = () => {
  const [activeTab, setActiveTab] = useState("profile-image");
  const [images, setImages] = useState([]);

  const [romanceMatching, setRomanceMatching] = useState(true);
  const [friendMatching, setFriendMatching] = useState(true);

  const [profile, setProfile] = useState("");

  // === 피드백 상태 & 행 컴포넌트 ===
  const [feedback, setFeedback] = useState([]);
  const [editingItem, setEditingItem] = useState(null);

  const openEdit = useCallback((item) => setEditingItem(item), []);
  const handleDelete = useCallback(async (item) => {
    if (!window.confirm("정말 삭제할까요?")) return;
    try {
      await api.patch(`/feedback/${item.id}/delete`);
      setFeedback((prev) => prev.filter((f) => f.id !== item.id));
    } catch (e) {
      console.error(e);
      alert("삭제 실패");
    }
  }, []);

  const FeedbackRow = memo(function FeedbackRow({ item, onEdit, onDelete }) {
    const titleShort   = ellipsisByWords(item.title, 8);
    const contentShort = ellipsisByWords(item.content, 24);

    return (
      <tr>
        <td className="title-cell" title={item.title}>
          <div className="cell-1line">{titleShort}</div>
        </td>

        <td className="content-cell" title={item.content}>
          <div className="cell-2lines">{contentShort}</div>
        </td>
        <td className="actions-cell">
          <button type="button" className="fb-btn fb-btn--edit" onClick={onEdit}>✎ <span>수정</span></button>
          <button type="button" className="fb-btn fb-btn--danger" onClick={onDelete}>🗑 <span>삭제</span></button>
        </td>
      </tr>
    );
  });

  // === 관심사 ===
  const [selectedInterests, setSelectedInterests] = useState([]);
  const interestsList = [
    '운동', '독서', '여행', '음악', '게임', '요리',
    '디지털 기술', '사진 촬영', '영화', '패션', '테크놀로지', '환경 보호'
  ];

  // === 찜한 사람 (프로필 카드용) ===
  const [hearted, setHearted] = useState([]);
  const [likesPage, setLikesPage] = useState(0);
  const [likesHasMore, setLikesHasMore] = useState(false);
  const [likesLoading, setLikesLoading] = useState(false);

  const handleMatchingSave = async () => {
    try {
      await api.put("/api/on/mypage/matching-settings", {
        romanceMatching,
        friendMatching
      });
      alert("매칭 설정이 저장되었습니다.");
    } catch (err) {
      console.error("매칭 설정 저장 실패:", err);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  const toggleTag = (tag) => {
    setSelectedInterests(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : prev.length < 6
          ? [...prev, tag]
          : (alert("최대 6개까지 선택 가능합니다."), prev)
    );
  };

  const handleInterestSave = async () => {
    try {
      await api.put("/api/on/mypage/interests", {
        interests: selectedInterests
      });
      alert("관심사가 수정되었습니다.");
    } catch (err) {
      console.error("관심사 수정 실패:", err);
      alert("수정 중 오류가 발생했습니다.");
    }
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    const main = formData.get("mainImage");
    const subs = formData.getAll("subImages");

    const sendData = new FormData();
    if (main && main.size > 0) sendData.append("mainImage", main);

    for (let i = 0; i < 2; i++) {
      const file = subs[i];
      if (file instanceof File && file.size > 0) {
        sendData.append("subImages", file);
      } else {
        sendData.append("subImages", new File([], ""));
      }
    }

    try {
      await api.post("/api/on/mypage/profile-images", sendData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      alert("업로드 완료!");
      fetchImages();
    } catch (err) {
      console.error("업로드 실패:", err);
    }
  };

  const fetchImages = async () => {
    try {
      const res = await api.get("/api/on/mypage/profile-images");
      setImages(res.data);
    } catch (err) {
      console.error("이미지 불러오기 실패:", err);
    }
  };

  const fetchMatchingSettings = async () => {
    try {
      const res = await api.get("/api/on/mypage/matching-settings");
      setRomanceMatching(res.data.romanceMatching);
      setFriendMatching(res.data.friendMatching);
    } catch (err) {
      console.error("매칭 설정 불러오기 실패:", err);
    }
  };

  const loadLikesPage = useCallback(async (pageIdx) => {
    setLikesLoading(true);
    try {
      const res = await api.get("/api/on/mypage/profile-likes", {
        params: { page: pageIdx, size: 24 }
      });
      const pageData = res.data; // Page<MemberProfileResponse>
      const content = pageData?.content ?? [];

      setHearted(prev => pageIdx === 0 ? content : [...prev, ...content]);
      setLikesHasMore(!(pageData?.last ?? true));
      setLikesPage(pageIdx);
    } catch (e) {
      console.error("찜한 사람 불러오기 실패:", e);
    } finally {
      setLikesLoading(false);
    }
  }, []);

  // 탭 전환 시 첫 페이지 로드
  useEffect(() => {
    if (activeTab === "likes") {
      loadLikesPage(0);
    }
  }, [activeTab, loadLikesPage]);

  useEffect(() => {
    const fetchInterests = async () => {
      try {
        const res = await api.get("/api/on/mypage/interests");
        setSelectedInterests(res.data.interests);
      } catch (err) {
        console.error("관심사 불러오기 실패:", err);
      }
    };

    const fetchProfile = async () => {
      try {
        const res = await api.get("/api/on/mypage/profile");
        setProfile(res.data);
      } catch (err) {
        console.error("프로필 정보 불러오기 실패:", err);
      }
    };
    const fetchFeedback = async () => {
      try {
        const res = await api.get("/feedback/my");
        setFeedback(res.data);
      } catch (err) {
        console.error("피드백 정보 불러오기 실패:", err);
      }
    };

    fetchImages();
    fetchInterests();
    fetchProfile();
    fetchMatchingSettings();
    fetchFeedback();
  }, []);

  return (
    <div className="mypage-container">
      <aside className="sidebar">
        <ul>
          <li className={activeTab==="profile-image"?"active":""} onClick={() => setActiveTab("profile-image")}>프로필 사진</li>
          <li className={activeTab==="profile"?"active":""} onClick={() => setActiveTab("profile")}>프로필 정보</li>
          <li className={activeTab==="matching"?"active":""} onClick={() => setActiveTab("matching")}>매칭 설정</li>
          <li className={activeTab==="likes"?"active":""} onClick={() => setActiveTab("likes")}>찜한 사람</li>
          <li className={activeTab==="history"?"active":""} onClick={() => setActiveTab("history")}>매칭 히스토리</li>
          <li className={activeTab==="feedback"?"active":""} onClick={() => setActiveTab("feedback")}>내 피드백 내역</li>
        </ul>
      </aside>

      <section className="mypage-content">
        {activeTab === "profile-image" && (
          <ProfileImageUpload images={images} onUpload={handleImageUpload} />
        )}

        {activeTab === "profile" && (
          <div className="setting-section">
            <h3>프로필 정보</h3>
            <div className="info-block">
              <p><strong>이름:</strong> {profile.name}</p>
              <p><strong>나이:</strong> {profile.age}세</p>
              <p><strong>이메일:</strong> {profile.email}</p>
              <p><strong>성별:</strong> {profile.gender}</p>
              <p><strong>매칭 희망 성별:</strong> {profile.lookingForGender}</p>
            </div>

            <h4>관심사</h4>
            <div className="interest-block">
              <div className="tag-grid">
                {interestsList.map((tag) => (
                  <span
                    key={tag}
                    className={`tag ${selectedInterests.includes(tag) ? "selected" : ""}`}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <p className="tag-note">* 최대 6개까지 선택할 수 있습니다.</p>
              <button className="submit-btn" onClick={handleInterestSave}>
                관심사 수정
              </button>
            </div>
          </div>
        )}

        {activeTab === "matching" && (
          <div className="setting-section">
            <h3>매칭 설정</h3>
            <div className="switch-group">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={romanceMatching}
                  onChange={(e) => setRomanceMatching(e.target.checked)}
                />
                <span className="slider"></span>
                <span className="label-text">연애 매칭 ON/OFF</span>
              </label>

              <label className="switch">
                <input
                  type="checkbox"
                  checked={friendMatching}
                  onChange={(e) => setFriendMatching(e.target.checked)}
                />
                <span className="slider"></span>
                <span className="label-text">친구 매칭 ON/OFF</span>
              </label>
            </div>
            <button className="submit-btn" onClick={handleMatchingSave}>
              변경하기
            </button>
          </div>
        )}

        {activeTab === "likes" && (
          <div className="setting-section">
            <h3>찜한 사람</h3>

            {!hearted.length && !likesLoading && (
              <div className="empty-state">아직 찜한 사람이 없어요.</div>
            )}

            <div className="liked-grid">
              {hearted.map((m, idx) => {
                const name = m.name || "익명";
                const age  = m.age ? `${m.age}세` : "";
                const gender = m.gender || "";
                const sub = [age, gender].filter(Boolean).join(" · ");

                return (
                  <article key={(m.memberId || m.id || name) + idx} className="liked-card">
                    {/* 배포후 추가 리팩토링 */}
                    {m.mainImageUrl ? (
                      <img className="liked-avatar" src={m.mainImageUrl} alt={name} />
                    ) : (
                      <div className="liked-avatar liked-avatar--placeholder">
                        {getInitials(name)}
                      </div>
                    )}
                    <div className="liked-meta">
                      <div className="liked-nick" title={name}>{name}</div>
                      {!!sub && <div className="liked-sub">{sub}</div>}
                    </div>
                    {/* 배포후 추가 리팩토링 */}
                    <button
                      className="liked-view-btn"
                      onClick={() => window.location.href = `/profile/${m.memberId || m.id}`}
                    >
                      프로필 보기
                    </button>
                  </article>
                );
              })}
            </div>

            <div className="liked-more">
              {likesHasMore && (
                <button
                  className="submit-btn outline"
                  disabled={likesLoading}
                  onClick={() => loadLikesPage(likesPage + 1)}
                >
                  {likesLoading ? "불러오는 중…" : "더 보기"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* === 피드백 렌더링 === */}
        {activeTab === "feedback" && (
          <div className="fb-scope">
            <table className="admin-table feedback-table">
              <colgroup>
                <col style={{ width: "28%" }} />
                <col style={{ width: "57%" }} />
                <col style={{ width: "15%" }} />
              </colgroup>
              <thead>
                <tr>
                  <th>제목</th>
                  <th>내용</th>
                  <th className="th-actions">관리</th>
                </tr>
              </thead>
              <tbody>
              {feedback.length === 0 ? (
                <tr>
                  <td colSpan={3}>
                    <div className="empty-state">등록된 피드백이 없습니다.</div>
                  </td>
                </tr>
              ) : (
                feedback.map((item) => (
                  <FeedbackRow
                    key={item.id}
                    item={item}
                    onEdit={() => openEdit(item)}
                    onDelete={() => handleDelete(item)}
                  />
                ))
              )}
              </tbody>
            </table>

            <FeedbackModal
              open={!!editingItem}
              onClose={() => setEditingItem(null)}
              mode="edit"
              initial={editingItem}
              submitter={async ({ id, title, content }) => {
                await api.patch(`/feedback/${id}/update`, { title, content });
                return { id, title, content };
              }}
              onSubmitted={({ id, title, content }) => {
                setFeedback((prev) => prev.map((f) => (f.id === id ? { ...f, title, content } : f)));
              }}
            />
          </div>
        )}
      </section>
    </div>
  );
};

export default MyPage;
