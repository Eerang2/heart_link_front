import { useEffect, useState } from "react";
import api from "../api/axiosInstance";
import "../styles/MainPage.css";

const dummyProfiles = [
  { id: 1, name: "유저1", likes: 120, img: "https://picsum.photos/200?random=1" },
  { id: 2, name: "유저2", likes: 100, img: "https://picsum.photos/200?random=2" },
  { id: 3, name: "유저3", likes: 80, img: "https://picsum.photos/200?random=3" },
];

const dummyCourses = [
  { id: 1, title: "한강 데이트", img: "https://picsum.photos/400/250?random=4" },
  { id: 2, title: "남산 타워", img: "https://picsum.photos/400/250?random=5" },
  { id: 3, title: "홍대 카페투어", img: "https://picsum.photos/400/250?random=6" },
  { id: 4, title: "제주도 여행", img: "https://picsum.photos/400/250?random=7" },
  { id: 5, title: "부산 해운대", img: "https://picsum.photos/400/250?random=8" },
  { id: 6, title: "경주 불국사", img: "https://picsum.photos/400/250?random=9" },
];

function MainPage() {
  const [profiles] = useState(dummyProfiles);
  const [courses] = useState(dummyCourses);
  const [index, setIndex] = useState(0); // 현재 캐러셀 시작 인덱스

  const visibleCourses = courses.slice(index, index + 4);

  const handlePrev = () => {
    if (index > 0) setIndex(index - 1);
  };

  const handleNext = () => {
    if (index < courses.length - 4) setIndex(index + 1);
  };

  // ⏱ 자동 슬라이드 (3초마다 이동)
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) =>
        prev < courses.length - 4 ? prev + 1 : 0
      );
    }, 6000);

    return () => clearInterval(interval);
  }, [courses.length]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await api.get("/api/on/ping");
      } catch (error) {
        console.error("❌ 요청 실패. 헤더 확인:", error.config?.headers);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="main-wrapper">
      <main className="main-container">
        {/* ✅ Hero Section */}
        <section className="hero">
          <h1 className="brand">ON : DA</h1>
          <p className="tagline">당신의 사랑이 온다 💕</p>
        </section>

        {/* ✅ 인기 프로필 TOP3 */}
        <section className="top-profiles">
          <h2>🏆 인기 프로필 TOP 3</h2>
          <div className="profile-rankings">
            <div className="profile-card second">
              <img src={profiles[1].img} alt={profiles[1].name} />
              <p>2등 {profiles[1].name}</p>
              <span>❤️ {profiles[1].likes}</span>
            </div>

            <div className="profile-card first">
              <img src={profiles[0].img} alt={profiles[0].name} />
              <p>🥇 1등 {profiles[0].name}</p>
              <span>❤️ {profiles[0].likes}</span>
            </div>

            <div className="profile-card third">
              <img src={profiles[2].img} alt={profiles[2].name} />
              <p>3등 {profiles[2].name}</p>
              <span>❤️ {profiles[2].likes}</span>
            </div>
          </div>
        </section>

        {/* ✅ 데이트 코스 추천 */}
        <section className="date-courses">
          <h2>📸 데이트 코스 추천</h2>
          <div className="course-carousel-wrapper">
            <button
              className="carousel-btn prev"
              onClick={handlePrev}
              disabled={index === 0}
            >
              ◀
            </button>

            <div className="course-carousel">
              {visibleCourses.map((course) => (
                <div key={course.id} className="course-card">
                  <img src={course.img} alt={course.title} />
                  <div className="course-overlay">
                    <p>{course.title}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              className="carousel-btn next"
              onClick={handleNext}
              disabled={index >= courses.length - 4}
            >
              ▶
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default MainPage;
