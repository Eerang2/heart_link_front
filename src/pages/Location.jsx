import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Location.css';

const LocationForm = () => {
    const [city, setCity] = useState('');
    const [district, setDistrict] = useState('');
    const [detail, setDetail] = useState('');
    const [lat, setLat] = useState(null);
    const [lng, setLng] = useState(null);
    const navigate = useNavigate();

    const openPostcodePopup = () => {
        new window.daum.Postcode({
            oncomplete: function (data) {
                const fullAddress = data.address;
                const sido = data.sido;
                const sigungu = data.sigungu;

                setCity(sido);
                setDistrict(sigungu);
                setDetail('');

                // 주소 → 좌표 변환
                const geocoder = new window.kakao.maps.services.Geocoder();
                geocoder.addressSearch(fullAddress, function (result, status) {
                    if (status === window.kakao.maps.services.Status.OK) {
                        setLat(result[0].y);
                        setLng(result[0].x);
                    }
                });
            }
        }).open();
    };

    const handleSubmit = async () => {
        const fullAddress = `${city} ${district} ${detail}`;
        try {
            const response = await axios.post('http://localhost:8080/api/member/location', {
                address: fullAddress,
                lat,
                lng
            }, {
                withCredentials: true
            });
            console.log('위치 저장 성공:', response.data);
            navigate('/main');
        } catch (err) {
            alert('위치 저장 실패: ' + (err.response?.data || err.message));
        }
    };

    return (
        <div className="location-container">
            <h2>사는 곳 입력</h2>

            <div className="input-group">
                <label>시 / 도</label>
                <input type="text" value={city} readOnly placeholder="시/도 자동입력" />
            </div>

            <div className="input-group">
                <label>시군구</label>
                <input type="text" value={district} readOnly placeholder="시군구 자동입력" />
            </div>

            <button type="button" className="search-btn" onClick={openPostcodePopup}>
                주소 찾기
            </button>

            <button className="submit-btn" onClick={handleSubmit}>위치 저장 후 시작하기</button>
        </div>
    );
};

export default LocationForm;
