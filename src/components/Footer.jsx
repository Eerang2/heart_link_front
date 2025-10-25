import React from "react";
import "../styles/Footer.css";

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-logo">
            <div className="footer-logo">
              <img src="/images/ONDALogo.png" alt="logo" className="logo-image" />
              <span className="logo-text">ON : DA</span>
            </div>
          </div>

          <ul className="footer-links">
            <li><a href="#">이용약관</a></li>
            <li><a href="#">개인정보처리방침</a></li>
            <li><a href="#">회사소개</a></li>
            <li><a href="#">이용안내</a></li>
          </ul>
        </div>

        <div className="footer-middle">
          <div className="footer-info">
            <p>상호명: 온다</p>
            <p>회사명: 은식진우 주식회사</p>
            <p>대표: 이 진우 , 정 은식</p>
            <p>주소: 사랑특별시 고백구 행복로 777 로맨스스퀘어 15층 1501호</p>
            <p>E-MAIL: re_coder@green.com</p>
          </div>

          <div className="footer-social">
            <span>Social</span>
            <div className="social-icons">
              <a href="#" className="social-icon bi bi-instagram"></a>
              <a href="#"><img src="/images/icon_kakao.png" className="social-icon-img" alt="kakao" /></a>
              <a href="#"><img src="/images/icon_share.png" className="social-icon-img" alt="share" /></a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <hr />
          <p>당신의 인연이 온:다</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
