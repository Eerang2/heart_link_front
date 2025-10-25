// ProfileForm.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import '../styles/profileForm.css';
import { useAuth } from "../context/AuthContext";

const interestsList = [
  '운동', '독서', '여행', '음악', '게임', '요리',
  '디지털 기술', '사진 촬영', '영화', '패션', '테크놀로지', '환경 보호'
];

const ProfileForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('M');
  const [birthday, setBirthday] = useState('');
  const [age, setAge] = useState(null);
  const [providerType, setProvider] = useState('');
  const [lookingFor, setLookingFor] = useState('F');
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [images, setImages] = useState([null, null, null]);
  const [previewUrls, setPreviewUrls] = useState(['', '', '']);
  const previewUrlsRef = useRef(['', '', '']); // 기존 URL 저장
  const [modalOpen, setModalOpen] = useState(false);
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);

  // --- 추가된 상태: 위치 정보 동의 여부 ---
  const [hasLocationAgreement, setHasLocationAgreement] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem('tempSignupToken');
    if (!token) {
      alert('임시 인증 정보가 없습니다.');
      navigate("/");
      return;
    }

    const payload = parseJwt(token);
    if (!payload) {
      alert("인증 정보 오류");
      navigate("/");
      return;
    }

    const { name, email, gender, birthday, age, providerType } = payload;
    setName(name || '');
    setEmail(email || '');
    setGender(gender || 'M');
    setLookingFor(gender === 'M' ? 'F' : 'M');
    setBirthday(birthday || '');
    setProvider(providerType || '');
    setAge(age || null);

    const agreementsString = localStorage.getItem('agreements');
    if (!agreementsString) {
      alert('약관 동의 정보가 없습니다.');
      navigate("/");
      return; // 약관 동의가 없으면 더 이상 진행하지 않음
    }

    // --- 약관 동의 정보를 기반으로 위치 동의 여부 설정 ---
    try {
      const agreements = JSON.parse(agreementsString);
      // agreements 객체에 LOCATION이라는 키가 있고, 그 값이 true인지 확인
      setHasLocationAgreement(agreements.LOCATION === true);
    } catch (error) {
      console.error("약관 동의 정보 파싱 오류:", error);
      setHasLocationAgreement(false); // 파싱 오류 시 위치 동의 없음으로 처리
    }
    // --- 추가 끝 ---

  }, [navigate]);

  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
          atob(base64).split('').map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join('')
      );
      return JSON.parse(jsonPayload);
    } catch (err) {
      console.error("JWT 파싱 오류", err);
      return null;
    }
  };

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, []);

  const toggleInterest = (interest) => {
    setSelectedInterests(prev => {
      if (prev.includes(interest)) return prev.filter(i => i !== interest);
      else if (prev.length < 6) return [...prev, interest];
      else {
        alert('관심사는 최대 6개까지 선택할 수 있습니다.');
        return prev;
      }
    });
  };

  const handleImageChange = (index, file) => {
    if (!file) return;
    const newImages = [...images];
    const newPreviews = [...previewUrls];

    // 이전 URL 제거
    if (previewUrlsRef.current[index]) {
      URL.revokeObjectURL(previewUrlsRef.current[index]);
    }

    const newUrl = URL.createObjectURL(file);
    newImages[index] = file;
    newPreviews[index] = newUrl;
    previewUrlsRef.current[index] = newUrl;

    setImages(newImages);
    setPreviewUrls(newPreviews);
  };

  const geocodeAddress = (address) => {
    const geocoder = new window.kakao.maps.services.Geocoder();
    geocoder.addressSearch(address, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        setLat(result[0].y);
        setLng(result[0].x);
        // console.log("위도 : ", result[0].y) // 디버그용 로그 제거
        // console.log("경도 : ", result[0].x) // 디버그용 로그 제거
      } else {
        console.error("주소 검색 실패:", status);
      }
    });
  };

  const handleLocationSearch = () => {
    const postcodeScript = document.createElement('script');
    postcodeScript.src = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    postcodeScript.onload = () => {
      new window.daum.Postcode({
        oncomplete: function (data) {
          const fullAddress = data.address;
          setCity(data.sido);
          setDistrict(data.sigungu);

          if (window.kakao && window.kakao.maps) {
            window.kakao.maps.load(() => geocodeAddress(fullAddress));
          } else {
            const mapScript = document.createElement("script");
            mapScript.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=f821b6a6603d5abb481e8e28e08bbf2f&autoload=true&libraries=services`;
            mapScript.onload = () => {
              window.kakao.maps.load(() => geocodeAddress(fullAddress));
            };
            mapScript.onerror = (error) => {
              console.error("Kakao Maps SDK 스크립트 로드 실패:", error);
            };
            document.head.appendChild(mapScript);
          }
        }
      }).open();
    };
    postcodeScript.onerror = (error) => {
      console.error("다음 우편번호 스크립트 로드 실패:", error);
    };
    document.head.appendChild(postcodeScript);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const agreementsString = localStorage.getItem('agreements');
    let agreements = {};
    try {
      agreements = JSON.parse(agreementsString) || {};
    } catch (error) {
      console.error("약관 동의 정보 파싱 오류:", error);
      agreements = {};
    }

    // --- dto 객체 구성 시 위치 정보 동의 여부에 따라 조건부 포함 ---
    const dto = {
      name, email, birthday, age, gender, lookingFor,
      providerType, interests: selectedInterests,
      agreements // 약관 동의 내용은 항상 포함
    };

    // hasLocationAgreement 상태를 사용하여 조건부로 위치 정보 추가
    // 또는 agreements.LOCATION을 직접 사용하여 조건부 추가
    if (agreements.LOCATION === true) { // 약관 객체의 LOCATION이 true일 경우만 추가
      dto.city = city;
      dto.district = district;
      dto.lat = lat;
      dto.lng = lng;
    }
    // --- 수정 끝 ---

    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(dto)], { type: 'application/json' }));
    images.forEach((img) => img && formData.append('images', img));

    const API_BASE = process.env.REACT_APP_API_BASE_URL

    try {
      let res = await axios.post(`${API_BASE}/api/member/profile`, formData, { withCredentials: true });
      const memberId = res.data;
      const response = await axios.post(`${API_BASE}/login/${memberId}`, null, { withCredentials: true });
      login(response.data.accessToken);
      navigate("/main");
    } catch (err) {
      const ax = err; // AxiosError
      const summary = [
        `message: ${ax.message}`,
        `url: ${ax.config?.url}`,
        `status: ${ax.response?.status}`,
        `data: ${typeof ax.response?.data === 'string' ? ax.response.data : JSON.stringify(ax.response?.data)}`
      ].join('\n');
      console.log(summary)

      // 개발 중엔 콘솔에 더 자세히
      // console.error('AXIOS ERROR:', ax.toJSON?.() ?? ax);
      alert('오류 발생: ' + (err.response?.data || err.message));
    }
  };

  return (
      <div className="container">
        <h1>회원 정보 입력</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>이름</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="input-group">
            <label>이메일</label>
            <input type="email" value={email} readOnly style={{ backgroundColor: 'gainsboro' }} />
          </div>
          <div className="input-group">
            <label>생일</label>
            <input type="date" value={birthday} readOnly style={{ backgroundColor: 'gainsboro' }} />
            {age && <p style={{ fontSize: '0.9em', color: '#666' }}>(만 {age}세)</p>}
          </div>
          <div className="input-group">
            <label>성별</label>
            <input type="text" value={gender === 'M' ? '남성' : '여성'} readOnly />
          </div>
          <div className="input-group">
            <label>찾는 성별</label>
            <select value={lookingFor} onChange={e => setLookingFor(e.target.value)} required>
              <option value="M">남성</option>
              <option value="F">여성</option>
              <option value="both">양성</option>
            </select>
          </div>
          <div className="input-group">
            <label>관심사</label>
            <button type="button" onClick={() => setModalOpen(true)}>관심사 선택</button>
            <div className="interest-list">
              {selectedInterests.map((interest, idx) => <span key={idx}>{interest}</span>)}
            </div>
          </div>

          {/* --- 위치 정보 동의 여부에 따른 조건부 렌더링 --- */}
          {hasLocationAgreement && ( // hasLocationAgreement 상태가 true일 경우에만 렌더링
              <div className="input-group">
                <label>사는 곳</label>
                <input type="text" value={`${city} ${district}`} readOnly placeholder="주소 찾기로 자동 입력" />
                <button type="button" onClick={handleLocationSearch}>주소 찾기</button>
              </div>
          )}
          {/* --- 조건부 렌더링 끝 --- */}

          <div className="input-group">
            <label>프로필 이미지 (최대 3장)</label>
            <div className="profile-images">
              {[0, 1, 2].map(i => (
                  <div className="image-upload" key={i}>
                    <label htmlFor={`image${i}`}>+</label>
                    <input type="file" id={`image${i}`} accept="image/*" onChange={e => handleImageChange(i, e.target.files[0])} />
                    {previewUrls[i] && <img src={previewUrls[i]} alt={`preview-${i}`} />}
                  </div>
              ))}
            </div>
          </div>
          <button type="submit" className="submit-btn">제출</button>
        </form>
        {modalOpen && (
            <div className="sign-up-modal" onClick={() => setModalOpen(false)}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h2>관심사 선택</h2>
                <div className="interest-selector">
                  {interestsList.map((interest, i) => (
                      <button key={i} type="button" className={selectedInterests.includes(interest) ? 'selected' : ''} onClick={() => toggleInterest(interest)}>
                        {interest}
                      </button>
                  ))}
                </div>
                <button type="button" onClick={() => setModalOpen(false)}>닫기</button>
              </div>
            </div>
        )}
      </div>
  );
};

export default ProfileForm;