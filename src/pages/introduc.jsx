import React from "react";

// 배포 즉시 사용 가능: /src/pages/AboutPage.jsx 로 저장 후 라우터에 <Route path="/about" element={<AboutPage/>}/> 추가
// 이미지 경로는 /public/images 에 배치되어 있다고 가정 (없으면 placeholder가 표시됩니다)

export default function AboutPage() {
    const members = [
        {
            name: "이진우",
            role: "팀장 · Full‑stack",
            desc:
                "프로젝트 총괄. 아키텍처 설계, 인증/보안(JWT/리프레시), 배포 파이프라인과 핵심 매칭 흐름을 책임.",
            photo: "/images/team_jinwoo.jpg",
            tags: ["리더십", "아키텍처", "보안"],
        },
        {
            name: "정은식",
            role: "든든한 팀원 · Frontend/UX",
            desc:
                "사용자 여정 전반의 UX/UI를 설계하고 반응형 컴포넌트, 실시간 채팅 UI, 접근성 개선을 주도.",
            photo: "/images/team_eunsik.jpg",
            tags: ["React", "UX", "접근성"],
        },
        {
            name: "이은섭",
            role: "확실한 조력자 · Backend/Data",
            desc:
                "JPA/Query 설계, ES(검색) 연동, 성능 튜닝과 운영 자동화를 담당. 장애 대응과 모니터링 체계 구축.",
            photo: "/images/team_eunseop.jpg",
            tags: ["Spring Boot", "JPA", "Elasticsearch"],
        },
    ];

    return (
        <div className="about-root">
            {/* HERO */}
            <section className="hero" aria-labelledby="about-title">
                <div className="hero__bg" aria-hidden="true" />
                <div className="hero__inner">
                    <h1 id="about-title" className="hero__title">ON : DA 소개</h1>
                    <p className="hero__subtitle">
                        그린컴퓨터 아카데미 학원 수료생 주니어 3명이 <strong>단 2개월</strong> 만에 완성한, 사랑을 잇는 서비스
                    </p>
                    <div className="badges">
                        <span className="badge">⏱ 2개월 집중 개발</span>
                        <span className="badge">👩‍💻 주니어 3명</span>
                        <span className="badge">🏫 Green Computer Academy</span>
                    </div>
                </div>
            </section>

            {/* STORY */}
            <section className="story" aria-label="프로젝트 스토리">
                <div className="section__header">
                    <h2>우리는 이렇게 만들었어요</h2>
                    <p>
                        팀장 <b>이진우</b>, 든든한 팀원 <b>정은식</b>, 확실한 조력자 <b>이은섭</b>. 각자의 역할에 집중하면서도
                        매일 짧고 강한 스탠드업으로 한 방향을 맞췄습니다. 인증 기반 로그인, 스마트 매칭, 커뮤니티, 채팅 등
                        실사용 서비스에 필요한 기능을 실제로 동작하도록 구현했습니다.
                    </p>
                </div>

                <ol className="timeline" aria-label="개발 타임라인">
                    <li>
                        <span className="dot"/>
                        <div>
                            <h3>주 1–2 : 설계 & 세팅</h3>
                            <p>요구사항 정의, 화면 설계, ERD/패키지 구조 수립, CI/CD 초안, 공용 컴포넌트 가이드.</p>
                        </div>
                    </li>
                    <li>
                        <span className="dot"/>
                        <div>
                            <h3>주 3–5 : 핵심 기능</h3>
                            <p>회원/인증, 프로필, 매칭 로직, 공지/피드백, 실시간 채팅, 반응형 UI, 접근성 점검.</p>
                        </div>
                    </li>
                    <li>
                        <span className="dot"/>
                        <div>
                            <h3>주 6–8 : 안정화 & 배포</h3>
                            <p>성능/예외 처리, 로깅·모니터링, 보안 강화, UX 폴리싱, 베타 배포.</p>
                        </div>
                    </li>
                </ol>
            </section>

            {/* TEAM */}
            <section className="team" aria-label="팀원 소개">
                <div className="section__header">
                    <h2>만든 사람들</h2>
                    <p>각자 할 일을 해내며, 서로의 빈틈을 메웠습니다.</p>
                </div>

                <div className="team-grid">
                    {members.map((m) => (
                        <article key={m.name} className="member" aria-label={`${m.name} ${m.role}`}>
                            <div className="avatar">
                                <img
                                    src={m.photo}
                                    onError={(e)=>{e.currentTarget.src="https://picsum.photos/200?grayscale";}}
                                    alt={`${m.name} 프로필 사진`}
                                    loading="lazy"
                                />
                            </div>
                            <div className="meta">
                                <h3 className="name">{m.name}</h3>
                                <p className="role">{m.role}</p>
                                <p className="desc">{m.desc}</p>
                                <div className="tags">
                                    {m.tags.map((t) => (
                                        <span className="tag" key={t}>{t}</span>
                                    ))}
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="cta" aria-label="시작하기">
                <div className="cta__box">
                    <h2>지금, ON : DA 를 시작해보세요</h2>
                    <p>스마트 매칭과 따뜻한 인터페이스로 좋은 인연을 만나세요.</p>
                    <a className="btn btn--primary" href="/random/matching">랜덤 매칭 시작</a>
                    <a className="btn btn--ghost" href="/communityList">커뮤니티 구경</a>
                </div>
            </section>

            <style>{`
        :root{
          --pink:#e91e63; --pink-600:#d81b60; --bg:#fff; --fg:#222; --muted:#666;
          --card:#fff; --border:rgba(0,0,0,.08); --shadow:0 10px 25px rgba(0,0,0,.08);
        }
        @media (prefers-color-scheme: dark){
          :root{ --bg:#0b0b0f; --fg:#f0f0f2; --muted:#a6a6b0; --card:#121219; --border:rgba(255,255,255,.08); --shadow:0 10px 25px rgba(0,0,0,.35); }
        }
        .about-root{background:var(--bg); color:var(--fg)}
        .section__header{max-width:960px;margin:0 auto 14px; text-align:center; padding:0 16px}
        .section__header h2{margin:0 0 6px; font-size:clamp(22px,3.4vw,32px)}
        .section__header p{margin:0; color:var(--muted)}

        /* HERO */
        .hero{position:relative; min-height:54dvh; display:grid; place-items:center; overflow:hidden; border-bottom:1px solid var(--border)}
        .hero__bg{position:absolute; inset:0; background:
          radial-gradient(60vw 60vw at 15% -10%, rgba(233,30,99,.18), transparent 60%),
          radial-gradient(40vw 40vw at 90% 10%, rgba(255,255,255,.05), transparent 70%);
          pointer-events:none;
        }
        .hero__inner{position:relative; text-align:center; padding:64px 16px; max-width:960px}
        .hero__title{margin:0 0 8px; font-size:clamp(28px,5vw,56px); font-weight:900; letter-spacing:-.3px}
        .hero__subtitle{margin:0 0 12px; color:var(--muted); font-size:clamp(14px,2.2vw,18px)}
        .badges{display:flex; gap:8px; justify-content:center; flex-wrap:wrap}
        .badge{background:var(--card); border:1px solid var(--border); border-radius:999px; padding:8px 12px; font-weight:700; box-shadow:var(--shadow)}

        /* STORY */
        .story{padding:44px 0}
        .timeline{max-width:960px; margin:16px auto 0; padding:0 16px; list-style:none; display:grid; gap:12px}
        .timeline li{display:grid; grid-template-columns:auto 1fr; gap:12px; align-items:start; background:var(--card); border:1px solid var(--border); border-radius:16px; box-shadow:var(--shadow); padding:14px}
        .timeline .dot{width:14px; height:14px; border-radius:999px; background:var(--pink); margin-top:6px}
        .timeline h3{margin:0 0 6px}
        .timeline p{margin:0; color:var(--muted)}

        /* TEAM */
        .team{padding:16px 0 56px}
        .team-grid{max-width:1120px; margin:12px auto 0; padding:0 16px; display:grid; gap:14px; grid-template-columns:repeat(12,1fr)}
        .member{grid-column:span 12; display:flex; gap:16px; align-items:flex-start; background:var(--card); border:1px solid var(--border); border-radius:16px; box-shadow:var(--shadow); padding:14px}
        @media (min-width:760px){ .member{grid-column:span 4; flex-direction:column; align-items:center; text-align:center} }
        .avatar img{width:112px; height:112px; border-radius:14px; object-fit:cover}
        .name{margin:6px 0 2px; font-weight:900}
        .role{margin:0 0 6px; color:var(--muted); font-weight:700}
        .desc{margin:0 0 10px; color:var(--muted)}
        .tags{display:flex; gap:6px; flex-wrap:wrap; justify-content:center}
        .tag{border:1px solid var(--border); background:var(--card); padding:6px 10px; border-radius:999px; font-size:12px; font-weight:700}

        /* CTA */
        .cta{padding:24px 16px 96px}
        .cta__box{max-width:960px; margin:0 auto; text-align:center; border:1px solid var(--border); border-radius:20px; background:var(--card); box-shadow:var(--shadow); padding:28px}
        .btn{appearance:none; border:1px solid var(--border); background:var(--card); color:var(--fg); padding:12px 18px; border-radius:14px; cursor:pointer; font-weight:700; box-shadow:var(--shadow); transition:.15s; margin:4px}
        .btn:hover{transform:translateY(-1px)}
        .btn--primary{background:var(--pink); color:#fff; border-color:transparent}
        .btn--primary:hover{background:var(--pink-600)}
        .btn--ghost{background:transparent}
      `}</style>
        </div>
    );
}
