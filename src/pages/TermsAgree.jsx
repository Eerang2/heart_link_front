import React, { useState } from "react";
import "../styles/termsAgree.css"; // CSS 경로에 맞게 조정
import { useNavigate } from "react-router-dom";

const modalData = {
    terms: `
    <h3>서비스 이용약관 동의</h3>
    <p>
      본 약관은 Heart Hunter(이하 "회사")가 제공하는 온라인 소개팅 서비스(이하 "서비스")의 이용과 관련하여, 회사와 회원 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.<br/><br/>
      회원은 본 서비스를 이용함에 있어 관계법령, 본 약관 및 회사가 정한 운영정책을 성실히 준수해야 하며, 타인의 권리를 침해하거나 건전한 서비스 이용을 방해하는 행위를 해서는 안 됩니다.<br/><br/>
      회사는 합리적인 사유가 발생할 경우 약관을 변경할 수 있으며, 변경된 약관은 사전 공지 후 적용됩니다. 회원은 변경된 약관에 동의하지 않을 경우 서비스 이용을 중단하고 탈퇴할 수 있습니다.
    </p>
  `,
    privacy: `
    <h3>개인정보 수집 및 이용 동의</h3>
    <p>
      회사는 회원 가입, 고객 문의 응대, 서비스 제공 및 개선을 위한 최소한의 개인정보를 수집합니다.<br/><br/>
      <strong>1. 수집 항목:</strong><br/>
      - 필수항목: 이름, 생년월일, 성별, 이메일, 연락처, 로그인 ID, 비밀번호<br/>
      - 서비스 이용 시 자동 생성되는 정보: IP 주소, 쿠키, 서비스 이용 기록 등<br/><br/>

      <strong>2. 이용 목적:</strong><br/>
      - 회원가입 및 본인 확인<br/>
      - 매칭 추천 및 커뮤니케이션 제공<br/>
      - 고객 응대 및 서비스 개선<br/><br/>

      <strong>3. 보유 및 이용기간:</strong><br/>
      - 회원 탈퇴 시까지<br/>
      - 단, 관련 법령에 의해 보존할 필요가 있는 경우 해당 기간까지 보관 (전자상거래법, 통신비밀보호법 등)
    </p>
  `,
    sensitive: `
    <h3>민감정보 수집 및 이용 동의</h3>
    <p>
      회사는 회원의 연애 매칭을 위한 고도화된 추천 서비스를 제공하기 위해 민감정보(성별, 나이, 연애 성향 등)를 수집·이용합니다.<br/><br/>
      민감정보는 다음과 같은 목적으로만 사용되며, 외부에 제공되지 않습니다.<br/><br/>
      <strong>1. 수집 항목:</strong><br/>
      - 성별, 나이, 선호 연령대, 이상형 정보, 연애 스타일, MBTI 등<br/><br/>

      <strong>2. 이용 목적:</strong><br/>
      - 개인 맞춤형 매칭 알고리즘 개선<br/>
      - 서비스의 정확성 및 만족도 향상<br/><br/>

      <strong>3. 보유 기간:</strong><br/>
      - 회원 탈퇴 시 즉시 파기<br/>
      - 단, 데이터 분석 목적의 경우에는 익명화 처리 후 활용 가능
    </p>
  `,
    location: `
    <h3>위치기반서비스 이용 동의</h3>
    <p>
      회사는 회원 간 거리 기반 매칭 기능 제공을 위해 위치정보를 수집·이용할 수 있습니다.<br/><br/>
      <strong>1. 수집 정보:</strong><br/>
      - 사는곳을 기반으로 위치검색<br/><br/>

      <strong>2. 이용 목적:</strong><br/>
      - 주변 사용자 기반 매칭 제공<br/>
      - 특정 지역 맞춤형 이벤트 또는 콘텐츠 제공<br/><br/>

      <strong>3. 보유 및 이용기간:</strong><br/>
      - 실시간 수집 후 즉시 분석 및 반영<br/>
      - 별도로 저장하지 않으며, 매칭 기능 외 목적으로 사용하지 않습니다.<br/><br/>

      회원은 위치정보 수집을 거부하거나 앱/브라우저에서 설정을 변경할 수 있으며, 이 경우 일부 서비스 이용에 제한이 있을 수 있습니다.
    </p>
  `,
    marketing: `
    <h3>마케팅 정보 수신 동의</h3>
    <p>
      회사는 다양한 혜택, 이벤트 및 신규 기능 안내를 위해 회원에게 마케팅 정보를 발송할 수 있으며, 이에 대한 수신 여부는 회원이 자율적으로 선택할 수 있습니다.<br/><br/>

      <strong>1. 수신 항목:</strong><br/>
      - 이메일, 문자 메시지(SMS), 앱 푸시 알림 등<br/><br/>

      <strong>2. 이용 목적:</strong><br/>
      - 신규 서비스 출시 안내<br/>
      - 프로모션 및 할인 이벤트 정보 제공<br/>
      - 고객 만족도 조사 등<br/><br/>

      <strong>3. 거부 방법:</strong><br/>
      - 수신 동의 이후에도 마케팅 메시지 내 거부 링크 또는 앱 설정에서 언제든지 철회 가능합니다.
    </p>
  `
};

const TermsAgree = () => {
    const [agreements, setAgreements] = useState({
        SERVICE_USE: false,
        PRIVACY: false,
        SENSITIVE_INFO: false,
        LOCATION: false,
        OVER_14: false,
        MARKETING: false,
    });
    const [modalContent, setModalContent] = useState("");
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    const handleAllChange = (e) => {
        const checked = e.target.checked;
        setAgreements({
            SERVICE_USE: checked,
            PRIVACY: checked,
            SENSITIVE_INFO: checked,
            LOCATION: checked,
            OVER_14: checked,
            MARKETING: checked,
        });
    };

    const handleChange = (key) => (e) => {
        setAgreements((prev) => ({ ...prev, [key]: e.target.checked }));
    };

    const openModal = (type) => {
        setModalContent(modalData[type]);
        setShowModal(true);
    };

    const closeModal = () => setShowModal(false);

    const collectAgreements = () => {
        localStorage.setItem("agreements", JSON.stringify(agreements));
        navigate("/signup");
    };

    const allChecked = Object.values(agreements).filter((_, i) => i < 5).every(Boolean);

    return (
        <div>
            <header>
                <div className="logo">Heart Hunter</div>
                <button className="join-btn" onClick={() => navigate("/signup")}>가입하기</button>
            </header>

            <div className="container">
                <h2>회원가입 전 약관 동의</h2>

                <div className="checkbox-group">
                    <label>
                        <input
                            type="checkbox"
                            checked={allChecked}
                            onChange={handleAllChange}
                        />
                        [전체 동의] 선택 항목을 포함하여 모든 약관에 동의합니다.
                    </label>
                </div>

                <hr/>
                <br/>

                <div className="checkbox-group">
                    <label>
                        <input
                            type="checkbox"
                            checked={agreements.SERVICE_USE}
                            onChange={handleChange("SERVICE_USE")}
                            required
                        /> [필수] 서비스 이용약관 동의
                    </label>
                    <button type="button" onClick={() => openModal("terms")}>자세히 보기</button>
                </div>

                <div className="checkbox-group">
                    <label>
                        <input
                            type="checkbox"
                            checked={agreements.PRIVACY}
                            onChange={handleChange("PRIVACY")}
                            required
                        /> [필수] 개인정보 수집 및 이용 동의
                    </label>
                    <button type="button" onClick={() => openModal("privacy")}>자세히 보기</button>
                </div>

                <div className="checkbox-group">
                    <label>
                        <input
                            type="checkbox"
                            checked={agreements.SENSITIVE_INFO}
                            onChange={handleChange("SENSITIVE_INFO")}
                            required
                        /> [필수] 민감정보 수집 및 이용 동의
                    </label>
                    <button type="button" onClick={() => openModal("sensitive")}>자세히 보기</button>
                </div>


                <div className="checkbox-group">
                    <label>
                        <input
                            type="checkbox"
                            checked={agreements.OVER_14}
                            onChange={handleChange("OVER_14")}
                            required
                        /> [필수] 만 14세 이상입니다
                    </label>
                </div>

                <div className="checkbox-group">
                    <label>
                        <input
                            type="checkbox"
                            checked={agreements.LOCATION}
                            onChange={handleChange("LOCATION")}
                            required
                        /> [선택] 위치기반서비스 이용 동의
                    </label>
                    <button type="button" onClick={() => openModal("location")}>자세히 보기</button>
                </div>

                <div className="checkbox-group">
                    <label>
                        <input
                            type="checkbox"
                            checked={agreements.MARKETING}
                            onChange={handleChange("MARKETING")}
                        /> [선택] 마케팅 정보 수신 동의
                    </label>
                    <button type="button" onClick={() => openModal("marketing")}>자세히 보기</button>
                </div>

                <div className="submit-area">
                    <button className="agree-btn" onClick={collectAgreements}>
                        가입하기
                    </button>
                </div>
            </div>

            {showModal && (
                <div className="modal" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-modal" onClick={closeModal}>×</button>
                        <div id="modalText" dangerouslySetInnerHTML={{__html: modalContent}}/>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TermsAgree;
