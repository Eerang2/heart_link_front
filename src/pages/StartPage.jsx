import React, { useEffect, useRef, useState } from "react";
import "../styles/StartPage.css";
import { requestNaverLogin } from "../services/oauth";

const StartPage = () => {
    const [showModal, setShowModal] = useState(false);
    const modalRef = useRef(null);

    // 스크롤 시 카드 순차 등장
    useEffect(() => {
        const blocks = document.querySelectorAll(".intro-block");
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) e.target.classList.add("visible");
                });
            },
            { threshold: 0.2 }
        );
        blocks.forEach((b) => io.observe(b));
        return () => io.disconnect();
    }, []);

    // 모달 열릴 때 바디 스크롤 락 + ESC 닫기
    useEffect(() => {
        if (showModal) {
            document.body.style.overflow = "hidden";
            const onKey = (e) => e.key === "Escape" && setShowModal(false);
            window.addEventListener("keydown", onKey);
            return () => {
                window.removeEventListener("keydown", onKey);
                document.body.style.overflow = "";
            };
        }
    }, [showModal]);

    // 모달 바깥 클릭 닫기
    const handleBackdrop = (e) => {
        if (modalRef.current && e.target === modalRef.current) setShowModal(false);
    };

    return (
        <div className="start-root">
            {/* 고정 헤더 */}
            <header className="start-header">
                <div className="start-header__inner">
                    <div className="brand">
                        <img className="brand__logo" src="/images/ONDALogo.png" alt="ON:DA 로고" />
                        <span className="brand__name">ON : DA</span>
                    </div>

                    <nav className="nav">
                        <a href="#features" className="nav__link">특징</a>
                        <a href="#how" className="nav__link">매칭 방식</a>
                        <a href="#cta" className="nav__link nav__link--primary" onClick={(e) => { e.preventDefault(); setShowModal(true); }}>
                            로그인/시작하기
                        </a>
                    </nav>
                </div>
            </header>

            {/* 히어로 */}
            <section className="hero" aria-labelledby="hero-title">
                <div className="hero__bg" aria-hidden="true" />
                <div className="hero__content">
                    <h1 id="hero-title" className="hero__title">
                        당신의 인연이 <span className="hero__accent">온:다</span>
                    </h1>
                    <p className="hero__subtitle">
                        인증 기반 신뢰 · 취향 매칭 알고리즘 · 따뜻한 인터페이스
                    </p>
                    <div className="hero__actions">
                        <button className="btn btn--primary" onClick={() => setShowModal(true)}>
                            네이버로 시작하기
                        </button>
                        <a href="#features" className="btn btn--ghost">더 알아보기</a>
                    </div>
                </div>
            </section>

            {/* 특징 */}
            <section id="features" className="intro" aria-label="서비스 특징">
                <div className="section__header">
                    <h2>왜 ON:DA 인가요?</h2>
                    <p>안전하고 설레는 만남을 위한 기본을 지켰어요.</p>
                </div>

                <div className="intro-content">
                    <article className="intro-block">
                        <img loading="lazy" src="/images/ONDALogo.png" alt="신뢰할 수 있는 프로필" />
                        <div className="intro-text">
                            <h3>진짜 사람들과의 만남</h3>
                            <p>인증된 사용자와의 만남으로 가짜 프로필 걱정 없이 시작해요.</p>
                        </div>
                    </article>

                    <article className="intro-block">
                        <img loading="lazy" src="/images/ONDALogo.png" alt="매칭 알고리즘" />
                        <div className="intro-text">
                            <h3>운명 같은 매칭</h3>
                            <p>취향·성향 기반 추천으로 대화가 자연스러운 상대를 찾아드려요.</p>
                        </div>
                    </article>

                    <article className="intro-block">
                        <img loading="lazy" src="/images/ONDALogo.png" alt="따뜻한 인터페이스" />
                        <div className="intro-text">
                            <h3>따뜻한 인터페이스</h3>
                            <p>눈에 편한 색상과 깔끔한 UI로 사용 경험을 높였어요.</p>
                        </div>
                    </article>
                </div>
            </section>

            {/* 매칭 방식 */}
            <section id="how" className="how" aria-label="매칭 방식">
                <div className="section__header">
                    <h2>매칭은 이렇게 진행돼요</h2>
                    <p>가입 → 취향/관심사 설정 → 스마트 매칭 → 대화 → 만남</p>
                </div>

                <ol className="steps">
                    <li className="step">
                        <span className="step__badge">1</span>
                        <div>
                            <h4>간단 가입</h4>
                            <p>네이버로 10초 만에 시작</p>
                        </div>
                    </li>
                    <li className="step">
                        <span className="step__badge">2</span>
                        <div>
                            <h4>취향 설정</h4>
                            <p>음악/영화/취미 등 관심사 선택</p>
                        </div>
                    </li>
                    <li className="step">
                        <span className="step__badge">3</span>
                        <div>
                            <h4>스마트 매칭</h4>
                            <p>AI 추천 + 랜덤 매칭 함께 제공</p>
                        </div>
                    </li>
                    <li className="step">
                        <span className="step__badge">4</span>
                        <div>
                            <h4>대화 & 약속</h4>
                            <p>안전한 채팅으로 편하게 대화</p>
                        </div>
                    </li>
                </ol>
            </section>

            {/* CTA */}
            <section id="cta" className="cta" aria-label="시작하기">
                <div className="cta__box">
                    <h2>지금 바로 시작해볼까요?</h2>
                    <p>지금 가입하면 맞춤 추천을 바로 받아볼 수 있어요.</p>
                    <button className="btn btn--primary btn--lg" onClick={() => setShowModal(true)}>
                        네이버로 시작하기
                    </button>
                </div>
            </section>

            {/* 푸터 */}
            <footer className="start-footer" role="contentinfo">
                <div className="footer__inner">
                    <span>© {new Date().getFullYear()} ON:DA</span>
                    <a href="/notices" className="footer__link">공지사항</a>
                    <a href="/feedback" className="footer__link">피드백</a>
                </div>
            </footer>

            {/* 로그인 모달 */}
            {showModal && (
                <div
                    className="start-modal"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="login-title"
                    ref={modalRef}
                    onClick={handleBackdrop}
                >
                    <div className="start-modal__panel" role="document">
                        <button
                            aria-label="닫기"
                            className="start-modal__close"
                            onClick={() => setShowModal(false)}
                        >
                            ×
                        </button>
                        <h2 id="login-title" className="start-modal__title">로그인</h2>
                        <p className="start-modal__desc">네이버 계정으로 간편하게 시작해요.</p>

                        <button onClick={requestNaverLogin} className="social-login naver">
                            네이버로 시작하기
                        </button>

                        <p className="modal-note">로그인 시 서비스 이용약관과 개인정보 처리방침에 동의하게 됩니다.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StartPage;
